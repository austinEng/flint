
#pragma once

#include <Eigen/Dense>
#include <iostream>
#include "Math.h"
#include "CullingVolume.h"

namespace flint {
namespace core {

template <typename T>
class Camera {

    T _azimuth = 0;
    T _altitude = 0;
    T _radius = 10;
    T _ratio = 1;
    T _fov = static_cast<T>(kPI / 2);
    T _near = static_cast<T>(0.1);
    T _far = static_cast<T>(1000);
    CullingVolume<3, 6, T> _cullingVolume;

    Eigen::Matrix<T, 3, 1> _center;
    mutable Eigen::Matrix<T, 3, 1> _eyeDir, _up, _right;
    mutable Eigen::Matrix<T, 4, 4> _view;
    mutable Eigen::Matrix<T, 4, 4> _projection;
    mutable bool _viewDirty = true;
    mutable bool _projectionDirty = true;

    void Recalculate() const {
        if (_viewDirty) {
            Eigen::AngleAxis<T> r1(_altitude, Eigen::Matrix<T, 3, 1> {0, 0, 1} );
            Eigen::AngleAxis<T> r2(_azimuth, Eigen::Matrix<T, 3, 1> {0, 1, 0} );

            _eyeDir = r2 * r1 * Eigen::Matrix<T, 3, 1>{ 1, 0, 0 };
            Eigen::Matrix<T, 3, 1> eyePos = _center + _eyeDir * _radius;

            _right = (-_eyeDir).cross(Eigen::Matrix<T, 3, 1> { 0, 1, 0 }).normalized();
            _up = _right.cross(-_eyeDir);

            T data[] = {
                _right(0, 0), _up(0, 0), _eyeDir(0, 0), 0,
                _right(1, 0), _up(1, 0), _eyeDir(1, 0), 0,
                _right(2, 0), _up(2, 0), _eyeDir(2, 0), 0,
                -_right.dot(eyePos), -_up.dot(eyePos), -_eyeDir.dot(eyePos), 1,
            };

            _view = Eigen::Matrix<T, 4, 4>(data);
        }

        if (_projectionDirty) {
            T mat00 = static_cast<T>(1 / (_ratio * std::tan(0.5 * _fov)));
            T mat11 = static_cast<T>(1 / tan(0.5 * _fov));
            T mat22 = static_cast<T>(-(_near + _far) / (_far - _near));
            T mat32 = static_cast<T>(-(2 * _near * _far) / (_far - _near));

            T data[] = {
                mat00,     0,     0,     0,
                0    , mat11,     0,     0,
                0    ,     0, mat22, mat32,
                0    ,     0,    -1,     0,
            };

            _projection = Eigen::Matrix<T, 4, 4>(data).transpose();
        }

        _viewDirty = false;
        _projectionDirty = false;
    }

    public:
        Camera() : _viewDirty(true), _projectionDirty(true), _cullingVolume(ComputeCullingVolume()) {

        }

        void SetAzimuth(T azimuth) {
            _azimuth = azimuth;
            _viewDirty = true;
        }

        void SetAltitude(T altitude) {
            _altitude = altitude;
            _viewDirty = true;
        }

        void SetAspectRatio(T ratio) {
            _ratio = ratio;
            _projectionDirty = true;
        }

        void SetFieldOfView(T fov) {
            _fov = fov;
            _projectionDirty = true;
        }

        void SetNearFar(T n, T f) {
            _near = n;
            _far = f;
            _projectionDirty = true;
        }

        void Rotate(T dAzimuth, T dAltitude) {
            _azimuth = static_cast<T>(std::fmod(_azimuth + dAzimuth, 2 * kPI));
            _altitude = _altitude + dAltitude;

            static constexpr T kHalfPI = static_cast<T>(kPI * 49.0 / 100.0);
            _altitude = _altitude < -kHalfPI ? -kHalfPI : _altitude;
            _altitude = _altitude > kHalfPI ? kHalfPI : _altitude;
            _viewDirty = true;
        }

        void Pan(T dX, T dY) {
            this->Recalculate();
            _center += _right * dX * _radius + _up * dY * _radius;
            _viewDirty = true;
        }

        void Move(const Eigen::Matrix<T, 3, 1> &dir) {
            this->Recalculate();
            _center += _right * dir[0] + _up * dir[1] + -_eyeDir * dir[2];
            _viewDirty = true;
        }

        void MoveGlobal(const Eigen::Matrix<T, 3, 1> &dir) {
            _center += dir;
            _viewDirty = true;
        }

        void Zoom(T factor) {
            _radius = _radius * std::exp(-factor);
            _viewDirty = true;
        }

        void LookAt(const Eigen::Matrix<T, 3, 1> center) {
            _center = center;
            _viewDirty = true;
        }

        void SetDistance(T distance) {
            _radius = distance;
            _viewDirty = true;
        }

        const Eigen::Matrix<T, 4, 4>& GetProjection() const {
            this->Recalculate();
            return _projection;
        }

        const Eigen::Matrix<T, 4, 4>& GetView() const {
            this->Recalculate();
            return _view;
        }

        T GetFieldOfView() const {
            return _fov;
        }

        Eigen::Matrix<T, 4, 4> GetViewProjection() const {
            return this->GetProjection() * this->GetView();
        }

        Eigen::Matrix<T, 3, 1> GetPosition() const {
            this->Recalculate();
            return _center + _eyeDir * _radius;
        }

        Eigen::Matrix<T, 3, 1> GetForward() const {
            this->Recalculate();
            return -_eyeDir;
        }

        void SetPosition(const Eigen::Matrix<T, 3, 1> &newPos) {
            _center += (newPos - GetPosition());
            _viewDirty = true;
        }

        CullingVolume<3, 6, T> ComputeCullingVolume() {
            this->Recalculate();

            T t = _near * static_cast<T>(std::tan(0.5 * _fov));
            T b = -t;
            T r = _ratio * t;
            T l = -r;
            T n = _near;
            T f = _far;

            Eigen::Matrix<T, 3, 1> forward = GetForward();
            Eigen::Matrix<T, 3, 1> eyePos = GetPosition();
            Eigen::Matrix<T, 3, 1> nearPlaneCenter = eyePos + forward * n;
            Eigen::Matrix<T, 3, 1> farPlaneCenter = eyePos + forward * f;

            Eigen::Matrix<T, 3, 1> normal;

            normal = ((nearPlaneCenter + _right * l) - eyePos).cross(_up).normalized();
            Eigen::Matrix<T, 4, 1> leftPlane = {
                normal[0], normal[1], normal[2],
                -normal.dot(eyePos),
            };

            normal = _up.cross((nearPlaneCenter + _right * r) - eyePos).normalized();
            Eigen::Matrix<T, 4, 1> rightPlane = {
                normal[0], normal[1], normal[2],
                -normal.dot(eyePos),
            };

            normal = _right.cross((nearPlaneCenter + _up * b) - eyePos).normalized();
            Eigen::Matrix<T, 4, 1> bottomPlane = {
                normal[0], normal[1], normal[2],
                -normal.dot(eyePos),
            };

            normal = ((nearPlaneCenter + _up * t) - eyePos).cross(_right).normalized();
            Eigen::Matrix<T, 4, 1> topPlane = {
                normal[0], normal[1], normal[2],
                -normal.dot(eyePos),
            };

            Eigen::Matrix<T, 4, 1> nearPlane = {
                forward[0], forward[1], forward[2],
                -forward.dot(nearPlaneCenter),
            };

            Eigen::Matrix<T, 4, 1> farPlane = {
                -forward[0], -forward[1], -forward[2],
                forward.dot(farPlaneCenter),
            };

            _cullingVolume = CullingVolume<3, 6, T>({
                leftPlane,
                rightPlane,
                bottomPlane,
                topPlane,
                nearPlane,
                farPlane,
            });

            return _cullingVolume;
        }

        const CullingVolume<3, 6, T>& GetCullingVolume() const {
            return _cullingVolume;
        }
    };

}
}
