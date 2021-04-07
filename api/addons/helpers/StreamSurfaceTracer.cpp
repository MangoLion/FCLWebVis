#include "StreamSurfaceTracer.h"
#include <iostream>
#include <algorithm>
#include "Steady3D.h"

StreamSurfaceTracer::StreamSurfaceTracer(Steady3D &steady3D)
{

	forward = true;
	stepSize = 1.0;
	length = 1;
	divergent_min = 3.;
	divergent_max = 5.;
	mStreamlineTracer = new StreamlineTracer(steady3D);
	mStreamlineTracer->setStepSize(stepSize);
	mStreamlineTracer->setForward(forward);
	mStreamlineTracer->setLength(length);
}

StreamSurfaceTracer::~StreamSurfaceTracer()
{
}

void StreamSurfaceTracer::setStepSize(const float &_stepSize)
{
	stepSize = _stepSize;
	mStreamlineTracer->setStepSize(stepSize);
}

void StreamSurfaceTracer::setLength(const int &_length)
{
	length = _length;
	mStreamlineTracer->setLength(length);
}

void StreamSurfaceTracer::setDivergence(const float min, const float max)
{
	divergent_min = min;
	divergent_max = max;
}

void StreamSurfaceTracer::setForward(const bool &_forward)
{
	forward = _forward;
	mStreamlineTracer->setForward(forward);
}

/*Calculate the surface normals Ref: https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal */
Vector3f StreamSurfaceTracer::getSurfaceNormals(vector<Vector3f> points)
{
	if (points.size() != 3)
	{
		printf("The surface is not triangle!");
		return Vector3f(0, 0, 0);
	}

	Vector3f U = points[1] - points[0];
	Vector3f V = points[2] - points[0];
	Vector3f N;
	N(0) = U(1) * V(2) - U(2) * V(1);
	N(1) = U(2) * V(0) - U(0) * V(2);
	N(2) = U(0) * V(1) - U(1) * V(0);
	return N;
}

void StreamSurfaceTracer::trace(vector<Vector3f> seedingCurve, int streamlineLength, vector<Vector3f> &vertices, vector<Vector3i> &faces, vector<Vector3f> &normals)
{

	length = streamlineLength;
	for (int i = 0; i < seedingCurve.size() - 1; i++)
	{
		getSurfaceFromTwoPoints(seedingCurve[i], seedingCurve[i + 1], streamlineLength, vertices, faces, normals);
	}

	for (int i = 0; i < normals.size(); i++)
	{
		normals[i].normalize();
	}
}

/*Add 3 points belonging to a triangle to the surface */
void StreamSurfaceTracer::addTriangle(vector<Vector3f> &vertices, vector<Vector3i> &faces, vector<Vector3f> &normals, vector<Vector3f> points)
{
	Vector3i fa;
	int search_space = 2 * length;
	Vector3f N = getSurfaceNormals(points);
	for (int j = 0; j < points.size(); j++)
	{
		bool isExist = false;
		for (int i = vertices.size() - 1; i >= std::max((int)vertices.size() - search_space, 0); i--)
		{
			if (vertices[i](0) == points[j](0) && vertices[i](1) == points[j](1) && vertices[i](0) == points[j](0))
			{
				fa(j) = i + 1;
				normals[i] += N;
				isExist = true;
				break;
			}
		}
		if (!isExist)
		{
			vertices.push_back(points[j]);
			normals.push_back(N);
			fa(j) = vertices.size();
		}
	}
	faces.push_back(fa);
}

/*Construct a surface from two streamlines given two seeding points
The implementation is based on the function advance_ribbon() from the paper
"Constructing Stream Surfaces in Steady 3D Vector Fields"
*/
void StreamSurfaceTracer::getSurfaceFromTwoPoints(Vector3f p1, Vector3f p2, int streamlineLength, vector<Vector3f> &vertices, vector<Vector3i> &faces, vector<Vector3f> &normals)
{

	vector<Vector3f> streamline1 = mStreamlineTracer->trace(p1, streamlineLength);
	vector<Vector3f> streamline2 = mStreamlineTracer->trace(p2, streamlineLength);

	bool isContinue = true;
	int i0 = 0, i1 = 1, j0 = 0, j1 = 1;

	while (isContinue)
	{
		// load the next quad
		Vector3f L0 = streamline1[i0];
		Vector3f L1 = streamline1[i1];

		Vector3f R0 = streamline2[j0];
		Vector3f R1 = streamline2[j1];

		// Check if the width of this quad is not greater than its height
		float minQuadHeight = min((L1 - L0).norm(), (R1 - R0).norm());
		float maxQuadWidth = max((L1 - R1).norm(), (L0 - R0).norm());

		if (maxQuadWidth >= divergent_min * minQuadHeight)
		{
			if (maxQuadWidth <= divergent_max * minQuadHeight)
			{
				// insert a new point
				Vector3f midPoint = (L0 + R0) / 2;
				int newStreamlineLength = min(streamline1.size() - i0, streamline2.size() - j0);
				getSurfaceFromTwoPoints(L0, midPoint, newStreamlineLength, vertices, faces, normals);

				getSurfaceFromTwoPoints(R0, midPoint, newStreamlineLength, vertices, faces, normals);

				isContinue = false;
				break;
			}
			else
			{
				isContinue = false;
				break;
			}
		}

		float left_dg = (L1 - R0).norm();
		float righ_dg = (L0 - R1).norm();
		float min_dg = min(left_dg, righ_dg);
		bool advance_on_left = (left_dg == min_dg);

		if (advance_on_left)
		{
			// write triangle (L0,R0,L1)
			vector<Vector3f> newTriangle;
			newTriangle.push_back(L0);
			newTriangle.push_back(R0);
			newTriangle.push_back(L1);
			addTriangle(vertices, faces, normals, newTriangle);

			// free point L0
			i0 = i1;
			i1 += 1;

			if (i1 >= streamline1.size())
			{
				newTriangle.clear();
				newTriangle.push_back(R0);
				newTriangle.push_back(R1);
				newTriangle.push_back(L1);
				addTriangle(vertices, faces, normals, newTriangle);
				isContinue = false;
				break;
			}
		}
		else
		{
			// write triangle (L0,R0,R1)
			vector<Vector3f> newTriangle;
			newTriangle.push_back(L0);
			newTriangle.push_back(R0);
			newTriangle.push_back(R1);
			addTriangle(vertices, faces, normals, newTriangle);

			//free point R0
			j0 = j1;
			j1 += 1;
			if (j1 >= streamline2.size())
			{
				newTriangle.clear();
				newTriangle.push_back(L0);
				newTriangle.push_back(R1);
				newTriangle.push_back(L1);
				addTriangle(vertices, faces, normals, newTriangle);
				isContinue = false;
				break;
			}
		}
	}
}