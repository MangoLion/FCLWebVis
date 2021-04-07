#include "Steady3D.h"

Steady3D::Steady3D()
{
}

void Steady3D::setData(float *_vfData)
{
	vfData = _vfData;
}

Steady3D::~Steady3D()
{
	delete[] vfData;
}

int Steady3D::getTupleIdx(int i, int j, int k, int fieldID)
{
	return DIMENSION_SIZE * (k * dims[1] * dims[0] + j * dims[0] + i) + fieldID;
}

/*Perform 3D interpolation to get a single velocity field at any given point*/
void Steady3D::get_field_at(float x, float y, float z, FieldID fieldId, float &outputValue)
{

	if (x < xRange[0] || x > xRange[1] ||
			y < yRange[0] || y > yRange[1] || z < zRange[0] || z > zRange[1])
	{
		outputValue = 0;
		return;
	}
	x += fabs(xRange[0]);
	y += fabs(yRange[0]);
	z += fabs(zRange[0]);

	float xd = (x - spacing[0] * int(x / spacing[0])) / spacing[0];
	float yd = (y - spacing[1] * int(y / spacing[1])) / spacing[1];
	float zd = (z - spacing[2] * int(z / spacing[2])) / spacing[2];

	float v1, v2, v3, v4, v5, v6, v7, v8;

	if (int(x / spacing[0]) >= dims[0] - 1 || int(y / spacing[1]) >= dims[1] - 1 || int(z / spacing[2]) >= dims[2] - 1)
	{

		//outputValue = vfData[ getTupleIdx(int(x / spacing[0]), int(y / spacing[1]), int(z / spacing[2]), fieldId) ];
		outputValue = 0;
	}
	else
	{
		/* get quad 1*/
		v1 = vfData[getTupleIdx(int(x / spacing[0]), int(y / spacing[1]), int(z / spacing[2]), fieldId)];
		v2 = vfData[getTupleIdx(int(x / spacing[0]) + 1, int(y / spacing[1]), int(z / spacing[2]), fieldId)];
		v3 = vfData[getTupleIdx(int(x / spacing[0]), int(y / spacing[1]) + 1, int(z / spacing[2]), fieldId)];
		v4 = vfData[getTupleIdx(int(x / spacing[0]) + 1, int(y / spacing[1]) + 1, int(z / spacing[2]), fieldId)];

		/* get quad 2*/
		v5 = vfData[getTupleIdx(int(x / spacing[0]), int(y / spacing[1]), int(z / spacing[2] + 1), fieldId)];
		v6 = vfData[getTupleIdx(int(x / spacing[0]) + 1, int(y / spacing[1]), int(z / spacing[2] + 1), fieldId)];
		v7 = vfData[getTupleIdx(int(x / spacing[0]), int(y / spacing[1]) + 1, int(z / spacing[2] + 1), fieldId)];
		v8 = vfData[getTupleIdx(int(x / spacing[0]) + 1, int(y / spacing[1]) + 1, int(z / spacing[2] + 1), fieldId)];

		// interpolate
		float c00 = v1 * (1 - xd) + v2 * xd;
		float c10 = v3 * (1 - xd) + v4 * xd;
		float c01 = v5 * (1 - xd) + v6 * xd;
		float c11 = v7 * (1 - xd) + v8 * xd;

		float c0 = c00 * (1 - yd) + c10 * yd;
		float c1 = c01 * (1 - yd) + c11 * yd;

		outputValue = c0 * (1 - zd) + c1 * zd;
	}

	if (outputValue < 1e-6 && outputValue > -1e-6)
		outputValue = 0;
	if (outputValue > 1e+10 || outputValue < -(1e+10))
		outputValue = 0;
}

/* Get all three velocity field vx,vy,vz at a given point (x,y,z) */
void Steady3D::get_vector_at(const float x, const float y, const float z, float &vx, float &vy, float &vz)
{
	get_field_at(x, y, z, Field_VX, vx);
	get_field_at(x, y, z, Field_VY, vy);
	get_field_at(x, y, z, Field_VZ, vz);
}

/* Compute jacobian matrix by using the point-based approach */
void Steady3D::getJacobian(const float x, const float y, const float z, Matrix3f &jac)
{
	float diffx = spacing[0], diffy = spacing[1], diffz = spacing[2];

	float ux, uy, uz, vx, vy, vz, wx, wy, wz;
	float u_right, u_left, u_up, u_down, u_inside, u_outside; // u is vx,
	float v_right, v_left, v_up, v_down, v_inside, v_outside; // v is vy
	float w_right, w_left, w_up, w_down, w_inside, w_outside; // w is vz

	ux = vx = wx = 2 * diffx;
	uy = vy = wy = 2 * diffy;
	uz = vz = wz = 2 * diffz;

	if (x + diffx >= xRange[1])
	{

		get_vector_at(x, y, z, u_right, v_right, w_right);

		ux = ux - diffx;
		vx = vx - diffx;
		wx = wx - diffx;
	}
	else
	{
		get_vector_at(x + diffx, y, z, u_right, v_right, w_right);
	}

	if (x - diffx < xRange[0])
	{

		get_vector_at(x, y, z, u_left, v_left, w_left);
		ux = ux - diffx;
		vx = vx - diffx;
		wx = wx - diffx;
	}
	else
	{
		get_vector_at(x - diffx, y, z, u_left, v_left, w_left);
	}

	if (y + diffy >= yRange[1])
	{

		get_vector_at(x, y, z, u_up, v_up, w_up);

		uy = uy - diffy;
		vy = vy - diffy;
		wy = wy - diffy;
	}
	else
	{
		get_vector_at(x, y + diffy, z, u_up, v_up, w_up);
	}

	if (y - diffy < yRange[0])
	{

		get_vector_at(x, y, z, u_down, v_down, w_down);

		uy = uy - diffy;
		vy = vy - diffy;
		wy = wy - diffy;
	}
	else
	{
		get_vector_at(x, y - diffy, z, u_down, v_down, w_down);
	}

	if (z + diffz >= zRange[1])
	{

		get_vector_at(x, y, z, u_outside, v_outside, w_outside);

		uz = uz - diffz;
		vz = vz - diffz;
		wz = wz - diffz;
	}
	else
	{
		get_vector_at(x, y, z + diffz, u_outside, v_outside, w_outside);
	}

	if (z - diffz < zRange[0])
	{

		get_vector_at(x, y, z, u_inside, v_inside, w_inside);

		uz = uz - diffz;
		vz = vz - diffz;
		wz = wz - diffz;
	}
	else
	{
		get_vector_at(x, y, z - diffz, u_inside, v_inside, w_inside);
	}

	jac(0, 0) = (u_right - u_left) / ux;		 // du / dx
	jac(0, 1) = (u_up - u_down) / uy;				 // du / dy
	jac(0, 2) = (u_outside - u_inside) / uz; // du / dz

	jac(1, 0) = (v_right - v_left) / vx;		 // dv / dx
	jac(1, 1) = (v_up - v_down) / vy;				 // dv / dy
	jac(1, 2) = (v_outside - v_inside) / vz; // dv / dz

	jac(2, 0) = (w_right - w_left) / wx;		 // dw / dx
	jac(2, 1) = (w_up - w_down) / wy;				 // dw / dy
	jac(2, 2) = (w_outside - w_inside) / wz; // dw / dz
}

void Steady3D::setDomainDimension(const int _dims[3])
{
	dims[0] = _dims[0];
	dims[1] = _dims[1];
	dims[2] = _dims[2];
}

void Steady3D::getDomainDimension(int _dims[3])
{
	_dims[0] = dims[0];
	_dims[1] = dims[1];
	_dims[2] = dims[2];
}

void Steady3D::setDataSpace(const float _spacing[3])
{
	spacing[0] = _spacing[0];
	spacing[1] = _spacing[1];
	spacing[2] = _spacing[2];
}

void Steady3D::setDataSpace(const double _spacing[3])
{
	spacing[0] = _spacing[0];
	spacing[1] = _spacing[1];
	spacing[2] = _spacing[2];
}

void Steady3D::getDataSpace(float _spacing[3])
{
	_spacing[0] = spacing[0];
	_spacing[1] = spacing[1];
	_spacing[2] = spacing[2];
}

void Steady3D::setOrigin(const float _origin[3])
{
	origin[0] = _origin[0];
	origin[1] = _origin[1];
	origin[2] = _origin[2];
}

void Steady3D::setOrigin(const double _origin[3])
{
	origin[0] = _origin[0];
	origin[1] = _origin[1];
	origin[2] = _origin[2];
}

void Steady3D::getOrigin(float _origin[3])
{
	_origin[0] = origin[0];
	_origin[1] = origin[1];
	_origin[2] = origin[2];
}

void Steady3D::getXRange(float _xRange[2])
{
	_xRange[0] = xRange[0];
	_xRange[1] = xRange[1];
}

void Steady3D::getYRange(float _yRange[2])
{
	_yRange[0] = yRange[0];
	_yRange[1] = yRange[1];
}

void Steady3D::getZRange(float _zRange[2])
{
	_zRange[0] = zRange[0];
	_zRange[1] = zRange[1];
}

void Steady3D::setDataRange(float _range[6])
{
	xRange[0] = _range[0];
	xRange[1] = _range[1];

	yRange[0] = _range[2];
	yRange[1] = _range[3];

	zRange[0] = _range[4];
	zRange[1] = _range[5];
}
