varying vec4 v_nearpos;
varying vec4 v_farpos;
varying vec3 v_position;
void main() {
    mat4 viewtransformf = modelViewMatrix;
    mat4 viewtransformi = inverse(modelViewMatrix);
    vec4 position4 = vec4(position, 1.0);
    vec4 pos_in_cam = viewtransformf * position4;
    pos_in_cam.z = -pos_in_cam.w;
    v_nearpos = viewtransformi * pos_in_cam;
    pos_in_cam.z = pos_in_cam.w;
    v_farpos = viewtransformi * pos_in_cam;
    v_position = position;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position4;
}