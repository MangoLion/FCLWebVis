#include "StreamlineTracer.h"
#include <iostream>

StreamlineTracer::StreamlineTracer(Steady3D &steady3D) : mSteady3D(&steady3D)
{
	forward = true;
	stepSize = 1.0;
	mSteady3D->getXRange(xRange);
	mSteady3D->getYRange(yRange);
	mSteady3D->getZRange(zRange);
}

StreamlineTracer::~StreamlineTracer()
{
}

vector<Vector3f> StreamlineTracer::trace(Vector3f seedingPoint, int length)
{
	vector<Vector3f> streamline;

	float x, y, z;

	x = seedingPoint(0);
	y = seedingPoint(1);
	z = seedingPoint(2);
	Vector3f p0 = Vector3f(x, y, z);
	
	streamline.push_back(p0);
	for (int i = 0; i < length; i++)
	{
		if (x > xRange[1] || x < xRange[0] || y > yRange[1] || y < yRange[0] || z > zRange[1] || z < zRange[0])
		{
			break;
		}
		float nx, ny, nz;
		//std::cout<<"Tracing value at:" <<x<<", "<<y<<", "<<z<<std::endl;
		getNextPointRK4(x, y, z, nx, ny, nz);
		Vector3f pNext = Vector3f(nx, ny, nz);
		if ((pNext - p0).norm() <= 1e-4)
		{
			break;
		}
		else
		{
			streamline.push_back(pNext);

			p0 = pNext;
			x = nx;
			y = ny;
			z = nz;
		}
	}

	return streamline;
}

void StreamlineTracer::setStepSize(const float &_stepSize)
{
	stepSize = _stepSize;
}

void StreamlineTracer::setLength(const int &_length)
{
	length = _length;
}

void StreamlineTracer::setForward(const bool &_forward)
{
	forward = _forward;
}

/* RK4 Integrator */
bool StreamlineTracer::getNextPointRK4(float x, float y, float z, float &nx, float &ny, float &nz)
{
	
	float vx1, vx2, vx3, vx4; //interial points of RK4
	float vy1, vy2, vy3, vy4;
	float vz1, vz2, vz3, vz4;
	float tmpx, tmpy, tmpz;
	float normVx, normVy, normVz;
	float h = stepSize; //1 - forward, -1 - backward

	if (!forward)
		h = -stepSize;

	mSteady3D->get_vector_at(x, y, z, vx1, vy1, vz1);
	//std::cout<<"vector value is:" <<vx1<<", "<<vx2<<", "<<vx3<<std::endl;
	//if (vx1 == 0 && vy1 == 0 && vz1 == 0)
	//	return false;
	normVx = vx1 / sqrt(vx1 * vx1 + vy1 * vy1 + vz1 * vz1);
	normVy = vy1 / sqrt(vx1 * vx1 + vy1 * vy1 + vz1 * vz1);
	normVz = vz1 / sqrt(vx1 * vx1 + vy1 * vy1 + vz1 * vz1);

	//vx1 = normVx;
	//vy1 = normVy;
	//vz1 = normVz;

	tmpx = x + 0.5 * h * vx1;
	tmpy = y + 0.5 * h * vy1;
	tmpz = z + 0.5 * h * vz1;

	mSteady3D->get_vector_at(tmpx, tmpy, tmpz, vx2, vy2, vz2);
	/*if (vx2 == 0 && vy2 == 0 && vz2 == 0)
		return false;*/
	normVx = vx2 / sqrt(vx2 * vx2 + vy2 * vy2 + vz2 * vz2);
	normVy = vy2 / sqrt(vx2 * vx2 + vy2 * vy2 + vz2 * vz2);
	normVz = vz2 / sqrt(vx2 * vx2 + vy2 * vy2 + vz2 * vz2);
	//vx2 = normVx;
	//vy2 = normVy;
	//vz2 = normVz;

	tmpx = x + 0.5 * h * vx2;
	tmpy = y + 0.5 * h * vy2;
	tmpz = z + 0.5 * h * vz2;
	mSteady3D->get_vector_at(tmpx, tmpy, tmpz, vx3, vy3, vz3);
	/*if (vx3 == 0 && vy3 == 0 && vz3 == 0)
		return false;*/
	normVx = vx3 / sqrt(vx3 * vx3 + vy3 * vy3 + vz3 * vz3);
	normVy = vy3 / sqrt(vx3 * vx3 + vy3 * vy3 + vz3 * vz3);
	normVz = vz3 / sqrt(vx3 * vx3 + vy3 * vy3 + vz3 * vz3);
	//vx3 = normVx;
	//vy3 = normVy;
	//vz3 = normVz;

	tmpx = x + h * vx3;
	tmpy = y + h * vy3;
	tmpy = z + h * vz3;

	mSteady3D->get_vector_at(tmpx, tmpy, tmpz, vx4, vy4, vz4);
	/*if (vx4 == 0 && vy4 == 0 && vz4 == 0)
		return false;*/
	normVx = vx4 / sqrt(vx4 * vx4 + vy4 * vy4 + vz4 * vz4);
	normVy = vy4 / sqrt(vx4 * vx4 + vy4 * vy4 + vz4 * vz4);
	normVz = vz4 / sqrt(vx4 * vx4 + vy4 * vy4 + vz4 * vz4);

	/*vx4 = normVx;
	vy4 = normVy;
	vz4 = normVz;*/

	nx = x + h * ((vx1 + 2 * vx2 + 2 * vx3 + vx4) / 6.0);
	ny = y + h * ((vy1 + 2 * vy2 + 2 * vy3 + vy4) / 6.0);
	nz = z + h * ((vz1 + 2 * vz2 + 2 * vz3 + vz4) / 6.0);
	return true;
}
