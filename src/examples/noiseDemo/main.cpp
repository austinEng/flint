#include <array>
#include <chrono>
#include <cstdlib>
#include <cmath>
#include <flint/core/Math.h>
#include <flint/core/Camera.h>
#include <flint/geometry/Sphere.h>
#include <flint/geometry/SphereBuffer.h>
#include <flint_viewport/Window.h>
#include <flint_viewport/Shader.h>
#include <flint_viewport/ShaderProgram.h>
#include <flint_viewport/CameraControls.h>
#include "../workers/testWorker/module.h"
#include "../workers/createGeometry/module.h"

using namespace flint;

float frequency = 1.0f;
geometry::SphereBuffer<3>* sphereBuffer = nullptr;
core::Camera<float> camera;
float smallNoiseStrength = 2.0;
float _smallNoiseStrength = smallNoiseStrength;
float largeNoiseStrength = 0.1;
float _largeNoiseStrength = largeNoiseStrength;
unsigned int _drawMode = 0;
GLenum drawModes[] = { GL_TRIANGLES, GL_LINES };

GLint viewProjLocation, timeLocation, smallNoiseStrengthLocation, largeNoiseStrengthLocation;
GLint positionLocation;
std::array<GLuint, 2> buffers = {};
GLuint& indexBuffer = buffers[0];
GLuint& vertexBuffer = buffers[1];
viewport::ShaderProgram shaderProgram;
unsigned int elementCount = 0;
bool initializeBuffers = false;
float t = 0;

static void resizeCallback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
    camera.SetAspectRatio(static_cast<float>(width) / static_cast<float>(height));
}

static void frame(void* ptr) {
    viewport::Window* window = reinterpret_cast<viewport::Window*>(ptr);

    glfwPollEvents();

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glUseProgram(shaderProgram.GetGLProgram());
    t += 0.005;
    glUniform1f(timeLocation, t);
    glUniformMatrix4fv(viewProjLocation, 1, false, camera.GetViewProjection().data());

    if (smallNoiseStrength != _smallNoiseStrength) {
        smallNoiseStrength = _smallNoiseStrength;
        glUniform1f(smallNoiseStrengthLocation, smallNoiseStrength);
    }

    if (largeNoiseStrength != _largeNoiseStrength) {
        largeNoiseStrength = _largeNoiseStrength;
        glUniform1f(largeNoiseStrengthLocation, largeNoiseStrength);
    }

    if (initializeBuffers) {
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexBuffer);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphereBuffer->GetTriangles()[0]) * sphereBuffer->GetTriangles().size(), sphereBuffer->GetTriangles().data(), GL_STATIC_DRAW);

        glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer);
        glBufferData(GL_ARRAY_BUFFER, sizeof(sphereBuffer->GetPositions()[0]) * sphereBuffer->GetPositions().size(), sphereBuffer->GetPositions().data(), GL_STATIC_DRAW);

        initializeBuffers = false;
    }

    if (elementCount > 0) {
        glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer);
        glEnableVertexAttribArray(positionLocation);
        glVertexAttribPointer(positionLocation, 3, GL_FLOAT, false, 0, 0);

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexBuffer);
        glDrawElements(drawModes[_drawMode], elementCount, GL_UNSIGNED_INT, 0);

        glDisableVertexAttribArray(positionLocation);
    }

    window->SwapBuffers();
}

int main(int argc, char** argv) {
    int width, height;
    if (argc < 3) {
        width = 800;
        height = 600;
    } else {
        width = atoi(argv[1]);
        height = atoi(argv[2]);
    }

    viewport::Window window("Noise Demo", width, height);
    glfwSetWindowSizeCallback(window.GetGLFWWindow(), resizeCallback);

    glViewport(0, 0, width, height);
    glClearColor(0.f, 0.f, 0.f, 1.f);
    glEnable(GL_DEPTH_TEST);

    glGenBuffers(buffers.size(), buffers.data());

    auto* sphereMemory = geometry::SphereBuffer<3>::GetRequiredMemory({{ 0, 0, 0 }, 6}, 6);
    sphereBuffer = sphereMemory->buffer;

    auto* createGeometryWorker = new threading::Worker<CreateGeometry>();
    createGeometryWorker->Call<&CreateGeometry::createSphereBuffer>(sphereMemory, sphereMemory->bytes, nullptr, [](void* data, int size, void* arg) {
        //auto* args = reinterpret_cast<decltype(sphereMemory)>(data);
        //sphereBuffer = args->buffer;

        elementCount = sphereBuffer->GetTriangles().size() * 3;
        printf("Created icosphere with %d triangles, %d vertices\n", sphereBuffer->GetTriangles().size(), sphereBuffer->GetPositions().size());

        initializeBuffers = true;
    });

    /*auto buffer = geometry::SphereBuffer<3>::Create(geometry::Sphere<3>({ 0, 0, 0 }, 6), 6);
    sphereBuffer = buffer.first;
    elementCount = sphereBuffer->GetTriangles().size() * 3;
    printf("Created icosphere with %d vertices\n", sphereBuffer->GetPositions().size());*/


    viewport::Shader vertexShader, fragmentShader;
    vertexShader.Load(R"(
        precision highp float;

        // GLSL textureless classic 3D noise "cnoise",
        // with an RSL-style periodic variant "pnoise".
        // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
        // Version: 2011-10-11
        //
        // Many thanks to Ian McEwan of Ashima Arts for the
        // ideas for permutation and gradient selection.
        //
        // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
        // Distributed under the MIT license. See LICENSE file.
        // https://github.com/stegu/webgl-noise
        //

        vec3 mod289(vec3 x)
        {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289(vec4 x)
        {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x)
        {
          return mod289(((x*34.0)+1.0)*x);
        }

        vec4 taylorInvSqrt(vec4 r)
        {
          return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec3 fade(vec3 t) {
          return t*t*t*(t*(t*6.0-15.0)+10.0);
        }

        // Classic Perlin noise
        float cnoise(vec3 P)
        {
          vec3 Pi0 = floor(P); // Integer part for indexing
          vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }

        // Classic Perlin noise, periodic variant
        float pnoise(vec3 P, vec3 rep)
        {
          vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
          vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }

        float turbulence( vec3 p ) {
            float w = 100.0;
            float t = -.5;
            for (float f = 1.0 ; f <= 10.0 ; f++ ){
                float power = pow( 2.0, f );
                t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
            }
            return t;
        }

        uniform mat4 viewProj;
        uniform float time;
        uniform float smallNoiseStrength;
        uniform float largeNoiseStrength;
        attribute vec3 position;
        varying vec3 fs_pos;
        varying vec3 fs_nor;
        varying float smallNoise;

        void main() {
            vec3 normal = normalize(position);
            smallNoise = 10.0 * -.10 * turbulence( 0.5 * normal + time );
            float largeNoise = 5.0 * pnoise( 0.5 * normal + vec3( 2.0 * time ), vec3(100.0) );
            float displacement = -smallNoiseStrength * smallNoise + largeNoiseStrength * largeNoise;

            vec3 newPosition = position + normal * displacement;

            fs_pos = newPosition;
            fs_nor = normal;
            gl_Position = viewProj * vec4(newPosition, 1.0);
        }
    )", GL_VERTEX_SHADER);

    fragmentShader.Load(R"(
        precision highp float;

        varying vec3 fs_pos;
        varying vec3 fs_nor;
        varying float smallNoise;

        float cosineColor(float a, float b, float c, float d, float t) {
            return a + b * cos(2.0 * 3.14159 * (c * t + d));
        }

        void main() {
            float t = clamp(0.0, smallNoise, 1.0);
            vec3 color = vec3(
                1.0,
                cosineColor(0.638, 0.478, 0.688, -0.531, sqrt(t)),
                cosineColor(0.5, 0.5, 0.528, 0.478, sqrt(t))
            );
            gl_FragColor = vec4(color, 1.0);
        }
    )", GL_FRAGMENT_SHADER);

    shaderProgram.Create(vertexShader, fragmentShader);
    positionLocation = glGetAttribLocation(shaderProgram.GetGLProgram(), "position");
    timeLocation = glGetUniformLocation(shaderProgram.GetGLProgram(), "time");
    viewProjLocation = glGetUniformLocation(shaderProgram.GetGLProgram(), "viewProj");
    smallNoiseStrengthLocation = glGetUniformLocation(shaderProgram.GetGLProgram(), "smallNoiseStrength");
    largeNoiseStrengthLocation = glGetUniformLocation(shaderProgram.GetGLProgram(), "largeNoiseStrength");

    if (positionLocation < 0) { fputs("Could not find position attribute", stderr); }
    if (timeLocation < 0) { fputs("Could not find time uniform", stderr); }
    if (viewProjLocation < 0) { fputs("Could not find viewProj uniform", stderr); }
    if (smallNoiseStrengthLocation < 0) { fputs("Could not find smallNoiseStrength uniform", stderr); }
    if (largeNoiseStrengthLocation < 0) { fputs("Could not find largeNoiseStrength uniform", stderr); }

    glUseProgram(shaderProgram.GetGLProgram());
    glUniform1f(smallNoiseStrengthLocation, smallNoiseStrength);
    glUniform1f(largeNoiseStrengthLocation, largeNoiseStrength);

    camera.SetAltitude(0);
    camera.SetAzimuth(0);
    camera.SetDistance(10);
    camera.SetAspectRatio(static_cast<float>(width) / static_cast<float>(height));
    camera.LookAt({ 0, 0, 0 });

    viewport::CameraControls<float> controls(camera, window.GetGLFWWindow());
    controls.SetCurrent();

    window.FrameLoop(frame);

    return 0;
}

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>

// Define JavaScript bindings
extern "C" {
    EMSCRIPTEN_KEEPALIVE
    void updateSmallNoiseStrength(float value) {
        _smallNoiseStrength = value;
    }

    EMSCRIPTEN_KEEPALIVE
    void updateLargeNoiseStrength(float value) {
        _largeNoiseStrength = value;
    }

    EMSCRIPTEN_KEEPALIVE
    void updateDrawMode(unsigned int drawMode) {
        _drawMode = drawMode;
    }
}

#endif
