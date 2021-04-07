#pragma once
#ifndef tornado_data
#define tornado_data
#include "structures.h"
void gen_tornado(int xs, int ys, int zs, int time);
void getTornadoVec(float xx, float yy, float zz, float& vx, float& vy, float& vz);
#endif // !tornado_data
