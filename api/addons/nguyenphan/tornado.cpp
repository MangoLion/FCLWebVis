#include <iostream>
#include <stdio.h>
#include <cassert>
#include <math.h>
#include <stdlib.h>
#include <cstring>
#include <vector>

#include <fstream>
using namespace std;


/* Resolution of the uniform rectilinear grid */
const float GRIDXMIN = 0.f;
const float GRIDYMIN = 0.f;
const float GRIDZMIN = 0.f;
const float GRIDXMAX = 1.f;
const float GRIDYMAX = 1.f;
const float GRIDZMAX = 1.f;
const int GRIDXNUM = 128;
const int GRIDYNUM = 128;
const int GRIDZNUM = 128;


/**
 * To make the code simple, the entire dataset will be loaded in this array
* loadedData[i][j][k][0] = vx at the cell (i,j,k)
* loadedData[i][j][k][1] = vy at the cell (i,j,k)
* loadedData[i][j][k][2] = vz at the cell (i,j,k)
*/
float tornado_data[GRIDXNUM][GRIDYNUM][GRIDZNUM][3];


/**
 *  Gen_Tornado creates a vector field of dimension [xs,ys,zs,3] from
 *  a proceedural function. By passing in different time arguements,
 *  a slightly different and rotating field is created.
 *
 *  The magnitude of the vector field is highest at some funnel shape
 *  and values range from 0.0 to around 0.4 (I think).
 *
 *  I just wrote these comments, 8 years after I wrote the function.
 *
 * Developed by Roger A. Crawfis, The Ohio State University
 *
 */
void gen_tornado(int xs, int ys, int zs, int time)

{

	float x, y, z;
	int ix, iy, iz;
	float r, xc, yc, scale, temp, z0;
	float r2 = 8;
	float SMALL = 0.00000000001;
	float xdelta = 1.0 / (xs - 1.0);
	float ydelta = 1.0 / (ys - 1.0);
	float zdelta = 1.0 / (zs - 1.0);

	int counter = 0;
	for (iz = 0; iz < zs; iz++)
	{
		z = iz * zdelta;                        // map z to 0->1
		xc = 0.5 + 0.1 * sin(0.04 * time + 10.0 * z);   // For each z-slice, determine the spiral circle.
		yc = 0.5 + 0.1 * cos(0.03 * time + 3.0 * z);    //    (xc,yc) determine the center of the circle.
		r = 0.1 + 0.4 * z * z + 0.1 * z * sin(8.0 * z); //  The radius also changes at each z-slice.
		r2 = 0.2 + 0.1 * z;                           //    r is the center radius, r2 is for damping
		for (iy = 0; iy < ys; iy++)
		{
			y = iy * ydelta;
			for (ix = 0; ix < xs; ix++)
			{
				x = ix * xdelta;
				temp = sqrt((y - yc) * (y - yc) + (x - xc) * (x - xc));
				scale = fabs(r - temp);
				/*
   *  I do not like this next line. It produces a discontinuity
   *  in the magnitude. Fix it later.
   *
   */
				if (scale > r2)
					scale = 0.8 - scale;
				else
					scale = 1.0;
				z0 = 0.1 * (0.1 - temp * z);
				if (z0 < 0.0)  z0 = 0.0;
				temp = sqrt(temp * temp + z0 * z0);
				scale = (r + r2 - temp) * scale / (temp + SMALL);
				scale = scale / (1 + z);
				tornado_data[ix][iy][iz][0] = scale * (y - yc) + 0.1 * (x - xc);
				tornado_data[ix][iy][iz][1] = scale * -(x - xc) + 0.1 * (y - yc);;
				tornado_data[ix][iy][iz][2] = scale * z0;;
			}
		}
	}
}


void getTornadoVec(float xx, float yy, float zz, float& vx, float& vy, float& vz) {
	int x = ((xx + 1.) / 2.) * 128;
	int y = ((yy + 1.) / 2.) * 128;
	int z = ((zz + 1.) / 2.) * 128;


	vx = tornado_data[x][y][z][0];
	vy = tornado_data[x][y][z][1];
	vz = tornado_data[x][y][z][2];
}

/*int main(int argc, char* argv[])
{
	gen_tornado(128, 128, 128, 1000);
	return 0;
}
*/