#pragma once

#include "Steady3D.h"
#include <vector>

class StreamlineTracer
{
public:
	StreamlineTracer(Steady3D &steady3D);
	~StreamlineTracer();

	void setStepSize(const float &_stepSize);
	void setLength(const int &_length);
	void setForward(const bool &_forward);

	vector<Vector3f> trace(Vector3f seedingPoint, int length);
	bool getNextPointRK4(float x, float y, float z, float &nx, float &ny, float &nz);

private:
	float xRange[2];
	float yRange[2];
	float zRange[2];
	Steady3D *mSteady3D;
	int length;
	bool forward;
	float stepSize;
};
