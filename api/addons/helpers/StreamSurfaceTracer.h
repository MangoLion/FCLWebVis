#pragma once

#include <iostream>
#include <algorithm>
#include <vector>
#include "Steady3D.h"
#include "StreamlineTracer.h"



class StreamSurfaceTracer
{
public:
	StreamSurfaceTracer(Steady3D &steady3D);
	~StreamSurfaceTracer();
	void setStepSize(const float& _stepSize);
	void setLength(const int& _length);
	void setForward(const bool& _forward);
	void setDivergence(const float min, const float max);
	//void trace(vector<Vector3f> seedingCurve, int streamlineLength, vector<Vector3f> &vertices, vector<Vector3i>& faces);
	//void addTriangle(vector<Vector3f> &vertices, vector<Vector3i> &faces, vector<Vector3f> points);
	//void getSurfaceFromTwoPoints(Vector3f p1, Vector3f p2, int streamlineLength, vector<Vector3f> &vertices, vector<Vector3i> &faces);

	Vector3f getSurfaceNormals(vector<Vector3f> points);
	void trace(vector<Vector3f> seedingCurve, int streamlineLength, vector<Vector3f> &vertices,  vector<Vector3i>& faces, vector<Vector3f> &normals );
	void addTriangle(vector<Vector3f> &vertices, vector<Vector3i> &faces, vector<Vector3f> &normals, vector<Vector3f> points);
	void getSurfaceFromTwoPoints(Vector3f p1, Vector3f p2, int streamlineLength, vector<Vector3f> &vertices, vector<Vector3i> &faces, vector<Vector3f> &normals);


private:

	StreamlineTracer* mStreamlineTracer;
	int length;
	bool forward;
	float stepSize;
	float divergent_min , divergent_max ;
	
};

