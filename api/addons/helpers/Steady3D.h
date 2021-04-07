#pragma once

#include <iostream>
#include <Eigen/Dense>
#include <Eigen/Eigenvalues>

using namespace std;
using namespace Eigen;

#define DIMENSION_SIZE 3

enum FieldID
{
	Field_VX = 0,
	Field_VY,
	Field_VZ
};

class Steady3D
{
protected:
	int dims[3];			 // how many points along X, Y, Z dimension,
	float xRange[2];	 // the minimum and maximum values of x-coordinates, not velocity!
	float yRange[2];	 // the minimum and maximum values of y-coordinates, not velocity!
	float zRange[2];	 // the minimum and maximum values of z-coordinates, not velocity!
	double spacing[3]; // the space (distance) between two neighboring points
	double origin[3];	 // the origin - this is equivalent to the miminum of xRange,yRange,zRange values
	float *vfData;		 // velocity field data

public:
	Steady3D();
	~Steady3D();

	void setData(float *_vfData);

	void readDataFromFile(){};

	/* Get all three velocity field vx,vy,vz at a given point (x,y,z) */
	void get_vector_at(const float x, const float y, const float z, float &vx, float &vy, float &vz);

	/* Compute jacobian matrix by using the point-based approach */
	void getJacobian(const float x, const float y, const float z, Matrix3f &jac);

	/*Perform 3D interpolation to get a single velocity field at any given point*/
	void get_field_at(float x, float y, float z, FieldID fieldId, float &outputValue);

	int getTupleIdx(int i, int j, int k, int fieldID);

	void setDomainDimension(const int _dims[3]);
	void getDomainDimension(int _dims[3]);

	void setDataSpace(const float _spacing[3]);
	void setDataSpace(const double _spacing[3]);
	void getDataSpace(float _spacing[3]);

	void setOrigin(const float _origin[3]);
	void setOrigin(const double _origin[3]);
	void getOrigin(float _origin[3]);

	void getXRange(float _xRange[2]);
	void getYRange(float _yRange[2]);
	void getZRange(float _zRange[2]);

	void setDataRange(float _range[6]);
};
