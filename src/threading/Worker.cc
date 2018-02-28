#include "Worker.h"

namespace threading {

#ifdef __EMSCRIPTEN__

void WorkerBase::SetLoop(WorkerBase::WorkerLoop loop, unsigned int fps) {
    emscripten_set_main_loop(loop, fps, false);
}

#else

void WorkerBase::SetLoop(WorkerBase::WorkerLoop loop, unsigned int fps) {
    reinterpret_cast<WorkerImpl*>(this)->SetLoop(loop, fps);
}

WorkerImpl::WorkerImpl()
  : shouldExit(false),
    thread(new std::thread(&WorkerImpl::EventLoop, this)) {
}

void WorkerImpl::CallImpl(WorkerFunction func, void* data, int size, WorkerCallback callback, void* arg) {
    std::unique_lock<std::mutex> lock(mutex);
    messageQueue.push(new WorkerMessage {
        func,
        data,
        size,
        arg,
        callback,
    });
    hasMessage.notify_one();
}

void WorkerImpl::SetLoop(WorkerLoop loopFunc, unsigned int fps) {
    loop = new std::thread([this, loopFunc, fps]() {
        while(!this->shouldExit) {
            runMutex.lock();
            loopFunc();
            runMutex.unlock();
            std::this_thread::sleep_for(std::chrono::milliseconds(1000 / fps));
        }
    });
}

WorkerImpl::~WorkerImpl() {
    if (!thread) {
        return;
    }

    this->Call<&WorkerImpl::ExitWorker>(nullptr, 0, this);

    if (thread->joinable()) {
        thread->join();
    }

    if (loop && loop->joinable()) {
        loop->join();
    }

    while (!messageQueue.empty()) {
        WorkerMessage* msg = messageQueue.front();
        messageQueue.pop();
        delete msg;
    }

    delete thread;
    delete loop;
}

WorkerBase::WorkerResponse WorkerImpl::ExitWorker(void*, int, void* workerPtr) {
    WorkerImpl* worker = reinterpret_cast<WorkerImpl*>(workerPtr);
    worker->shouldExit = true;
    return { 0, 0 };
}

void WorkerImpl::EventLoop() {
    while(!shouldExit) {
        WorkerMessage* msg;
        {
            std::unique_lock<std::mutex> lock(mutex);
            while (messageQueue.empty()) {
                hasMessage.wait(lock);
            }

            if (messageQueue.empty()) {
                continue;
            }

            msg = messageQueue.front();
            messageQueue.pop();
        }
        
        runMutex.lock();
        WorkerResponse response = msg->func(msg->data, msg->size, msg->arg);
        msg->callback(response.data, response.size, msg->arg);
        runMutex.unlock();
        delete msg;
    }
}

#endif

}
