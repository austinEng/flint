#pragma once
#include <map>
#include <memory>

namespace flint {
namespace rendering {
namespace gl {

template <typename T>
class SerialCounted {
    class Tracker {
    public:
        static Tracker& GetInstance() {
            static Tracker tracker;
            return tracker;
        }

        Tracker() : nextSerial(1) {

        }

        uint32_t Next() {
            return nextSerial++;
        }

        uint32_t nextSerial;
        std::map<uint32_t, std::weak_ptr<T>> objects;
    };

    std::map<uint32_t, std::weak_ptr<T>>& objects() {
        return Tracker::GetInstance().objects;
    }

    std::shared_ptr<T> object = nullptr;
    uint32_t serial = 0;

public:
    SerialCounted() {}

    SerialCounted(T* ptr) {
        object = std::shared_ptr<T>(ptr);
        serial = Tracker::GetInstance().Next();
        objects().emplace(serial, object);
    }

    template <typename... Args>
    void Create(Args&&...args) {
        Release();
        object = std::make_shared<T>(std::forward<Args>(args)...);
        serial = Tracker::GetInstance().Next();
        objects().emplace(serial, object);
    }

    void Release() {
        if (serial && object.use_count() == 1) {
            objects().erase(serial);
        }
        object = nullptr;
        serial = 0;
    }

    ~SerialCounted() {
        Release();
    }

    T* operator->() {
        return object.get();
    }

    const T* operator->() const {
        return object.get();
    }

    operator uint32_t() {
        return serial;
    }
};

}
}
}
