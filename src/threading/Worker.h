#pragma once

#include <flint/debug/Print.h>

namespace threading {

struct WorkerBase {
    using WorkerRespond = void(*)(void*, int);
    struct WorkerResponse {
        void* data;
        int size;
    };
    using WorkerCallback = void(*)(void*, int, void*);
    using WorkerFunction = WorkerResponse(*)(void*, int, void*);
    using WorkerLoop = void(*)();
};

}

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>

namespace threading {

template <WorkerBase::WorkerFunction F>
struct WorkerFunctionMap {
    static const char* Name;
};

template <WorkerBase::WorkerFunction F> const char* WorkerFunctionMap<F>::Name;

#define EXPORT_WORKER_FUNCTION(Module, name) \
template<> const char* EMSCRIPTEN_KEEPALIVE ::threading::WorkerFunctionMap<&Module::name>::Name = #Module "__" #name; \
extern "C" { \
    EMSCRIPTEN_KEEPALIVE \
    void Module ## __ ## name (void* data, int size, void* arg, threading::WorkerBase::WorkerCallback callback) { \
        threading::WorkerBase::WorkerResponse response = Module::name(data, size, arg); \
        emscripten_worker_respond(reinterpret_cast<char*>(response.data), response.size); \
    } \
}

template <typename Module>
class Worker : public WorkerBase {
public:
    Worker(int argc = 0, char** argv = nullptr) {
        char buffer[100];
        EM_ASM_({
            Module.stringToUTF8(Module.getWorkerURL(Module.UTF8ToString($0)), $1, 100);
        }, Module::GetName(), reinterpret_cast<int>(buffer));
        handle = emscripten_create_worker(buffer);
    }

    template <WorkerBase::WorkerFunction Function>
    void Call(void* data, int size, void* arg = nullptr, WorkerCallback callback = [](void*, int, void*) {}) {
        struct WrappedCallback {
            WorkerCallback callback;
            void* arg;
        };

        emscripten_call_worker(handle, WorkerFunctionMap<Function>::Name, reinterpret_cast<char*>(data), size, [](char* data, int size, void* arg) {
            WrappedCallback* wrappedCallback = reinterpret_cast<WrappedCallback*>(arg);
            wrappedCallback->callback(data, size, wrappedCallback->arg);
            delete wrappedCallback;
        }, new WrappedCallback{ callback, arg });
    }

private:
    worker_handle handle;
};

static void SetWorkerLoop(WorkerBase*, WorkerBase::WorkerLoop loop, unsigned int fps) {
    emscripten_set_main_loop(loop, fps, false);
}

#define WORKER_MAIN(Module, body) \
int Module:: Main(int argc, char** argv, threading::Worker<Module>* worker) { \
    body; \
} \
int main(int argc, char** argv) { \
    return Module:: Main(argc, argv, nullptr); \
}

}

#else

#include <thread>
#include <queue>
#include <mutex>

namespace threading {

class WorkerImpl : public WorkerBase {
public:
    WorkerImpl();
    virtual ~WorkerImpl();

    template <WorkerBase::WorkerFunction Function>
    void Call(void* data, int size, void* arg = nullptr, WorkerCallback callback = [](void*, int, void*) {}) {
        CallImpl(Function, data, size, callback, arg);
    }

    void CallImpl(WorkerFunction func, void* data, int size, WorkerCallback callback, void* arg);

    void SetLoop(WorkerLoop loop, unsigned int fps);

private:
    static WorkerResponse ExitWorker(void*, int, void* arg);
    void EventLoop();

    struct WorkerMessage {
        WorkerFunction func;
        void* data;
        int size;
        void* arg;
        WorkerCallback callback;
    };

    bool shouldExit;
    std::mutex mutex;
    std::mutex runMutex;
    std::condition_variable hasMessage;
    std::queue<WorkerMessage*> messageQueue;
    std::thread* thread = nullptr;
    std::thread* loop = nullptr;
};

template <typename Module>
class Worker : public WorkerImpl {
public:
    Worker(int argc = 0, char** argv = nullptr) : WorkerImpl() {
        int status = Module::Main(argc, argv, this);
    }
};

static void SetWorkerLoop(WorkerImpl* worker, WorkerBase::WorkerLoop loop, unsigned int fps) {
    worker->SetLoop(loop, fps);
}

#define WORKER_MAIN(Module, body) \
int Module ## ::Main(int argc, char** argv, threading::Worker<Module>* worker) { \
    body; \
}

}

#endif
