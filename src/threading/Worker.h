#pragma once

namespace threading {

struct WorkerBase {
    using WorkerRespond = void(*)(void*, int);
    struct WorkerResponse {
        void* data;
        int size;
    };
    using WorkerCallback = void(*)(void*, int, void*);
    using WorkerFunction = WorkerResponse(*)(void*, int, void*);
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
    Worker() {
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
    std::condition_variable hasMessage;
    std::queue<WorkerMessage*> messageQueue;
    std::thread* thread = nullptr;
};

template <typename Module>
class Worker : public WorkerImpl {
public:
    Worker() : WorkerImpl() { }
};

}

#endif
