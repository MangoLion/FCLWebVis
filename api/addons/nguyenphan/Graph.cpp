#include <ctype.h>
#include <string>
#include <sstream>
#include <iostream>
#include <fstream>
#include "Reader.h"
#include "structures.h"
#include "globals.h"

#include <bitset>
#include <unordered_map>
#include "SparseMatrix/SparseMatrix.cpp"
#include <complex>

#include "glm/glm.hpp"
#include "glm/gtx/quaternion.hpp"

#include "kdtree.h"
//https://github.com/aniketalshi/KDTree

using namespace std;

KDTree kdtree;
//std::vector<point_t> kdNodes;
//node_main** grid_main = new node_main * [50];
std::vector<std::vector<node>> streamlines;
//std::vector<node *> bins[5][5];
std::vector<segment *> segment_starters;
int bin_width_segment = 2,
		bin_num_segment = 2 * 50;
std::vector<segment *> bins_segment[2][2];

float debugA_xyz[3] = {0, 0, 0},
			debugB_xyz[3] = {0, 0, 0};

int search_sections = 3, search_neighbor_index = 0;
segment seg_base, *seg_neighbors = new segment[10];
int seg_neighbors_num = 0;

float matrix_region_x1 = -0.5, matrix_region_x2 = 0.5, matrix_region_y1 = -0.5, matrix_region_y2 = 0.5, matrix_region_z1 = -0.5, matrix_region_z2 = 0.5;
int segment_offset = -1;
int draw_base = 0;
float SL_LENGTH = 1 / 10.;
struct edge_cell
{
	unsigned char is_edge : 1, is_undirect : 1;

	edge_cell()
	{
		is_edge = 0;
		is_undirect = 0;
	}
	bool operator==(const edge_cell &other) const
	{
		return is_edge == other.is_edge;
	}
};

ostream &operator<<(ostream &os, const edge_cell &cell)
{
	os << (int)cell.is_edge;
	return os;
}

segment **all_segments;
SparseMatrix<edge_cell> *m_edges, *m_edge_type; //SparseMatrix<std::bitset<1>>(3000)
class sparse_arr_key
{
public:
	int x;
	int y;
	sparse_arr_key(int xx, int yy)
	{
		x = xx;
		y = yy;
	}

	bool operator==(const sparse_arr_key &other) const
	{
		return x == other.x && y == other.y;
	}
};
//unordered_map<sparse_arr_key, indirect_edge> m_indirect_edges;

int segment_num = 0;
/**
 * @brief direction constants, for 2D
 * 
 */
const int DIR_LEFT = 0, DIR_RIGHT = 1, DIR_NA = -1;

/**
 * @brief constant for the search range of each graph node to find its neighbors
 * 
 */
const float search_range = 3;

/**
 * @brief get the determinant of a 2x2 matrix
 */
inline double Det(double a, double b, double c, double d)
{
	return a * d - b * c;
}

/**
 * @brief Returns true if x is in range [low..high], else false 
 * 
 */
bool inRange(float low, float high, float x)
{
	return ((x - high) * (x - low) <= 0);
}

/**
 * @brief Calculate intersection of two lines.
 * http://mathworld.wolfram.com/Line-LineIntersection.html
 * 
 * @param x1 Line 1 start
 * @param y1 Line 1 start
 * @param x2 Line 1 end
 * @param y2 Line 1 end
 * @param x3 Line 2 start
 * @param y3 Line 2 start
 * @param x4 Line 2 end
 * @param y4 Line 2 end
 * @param ixOut intersection x result
 * @param iyOut intersection y result
 * @return true if intersection is found
 * @return false if intersection is not found or error
 */
bool LineLineIntersect(double x1, double y1,				 //Line 1 start
											 double x2, double y2,				 //Line 1 end
											 double x3, double y3,				 //Line 2 start
											 double x4, double y4,				 //Line 2 end
											 double &ixOut, double &iyOut) //Output
{

	double detL1 = Det(x1, y1, x2, y2);
	double detL2 = Det(x3, y3, x4, y4);
	double x1mx2 = x1 - x2;
	double x3mx4 = x3 - x4;
	double y1my2 = y1 - y2;
	double y3my4 = y3 - y4;

	double xnom = Det(detL1, x1mx2, detL2, x3mx4);
	double ynom = Det(detL1, y1my2, detL2, y3my4);
	double denom = Det(x1mx2, y1my2, x3mx4, y3my4);
	if (denom == 0.0) //Lines don't seem to cross
	{
		ixOut = NAN;
		iyOut = NAN;
		return false;
	}

	ixOut = xnom / denom;
	iyOut = ynom / denom;
	if (!isfinite(ixOut) || !isfinite(iyOut)) //Probably a numerical issue
		return false;

	return true; //All OK
}

std::vector<segment *> get_segments_in_area(float x1, float y1, float z1, float x2, float y2, float z2, segment *exclude)
{
	//cout << "searching " << abs(x1 - x2) << ", " << abs(y1 - y2) << ", " << abs(z1 - z2) << endl;
	std::vector<segment *> results;
	for (int i = 0; i < segment_starters.size(); i++)
	{
		segment *s = segment_starters[i];
		while (s != nullptr)
		{
			if (inRange(x1, x2, s->middle->x) &&
					inRange(y1, y2, s->middle->y) &&
					inRange(z1, z2, s->middle->z) &&
					s->streamline_index != exclude->streamline_index)
			{
				//cout << "found";
				//cout << "x: " << s->middle->x << " btw " << x1 << ", " << x2 << endl;
				//cout << "y: " << s->middle->y << " btw " << y1 << ", " << y2 << endl;
				//cout << "z: " << s->middle->z << " btw " << z1 << ", " << z2 << endl;
				results.push_back(s);
			}
			s = s->next;
		}
	}
	return results;
}

/**
 * @brief Get the graph segments within a rectangular area
 * 
 * @param x1 first x of the rect area
 * @param y1 first y of the rect area
 * @param x2 second x  of the rect area
 * @param y2 second y of the rect area
 * @return std::vector<segment*>* 
 */
std::vector<segment *> get_segments_in_area(float x1, float y1, float z1, float x2, float y2, float z2)
{
	std::vector<segment *> results;
	for (int i = 0; i < segment_starters.size(); i++)
	{
		segment *s = segment_starters[i];
		while (s != nullptr)
		{
			if (inRange(x1, x2, s->middle->x) &&
					inRange(y1, y2, s->middle->y) &&
					inRange(z1, z2, s->middle->z))
			{
				results.push_back(s);
			}
			s = s->next;
		}
	}
	return results;
}

/**
 * @brief from the center of the segment, raycast into two perpendicular directions and check for intersections with surrounding segments
 * 
 * @param s 
 * @param direction 
 */
void raycast_segment(segment *s, int direction)
{
}

struct vec3d
{
	float x, y, z;
	vec3d(float xx, float yy, float zz)
	{
		x = xx;
		y = yy;
		z = zz;
	}

	vec3d(node n)
	{
		x = n.x;
		y = n.y;
		z = n.z;
	}

	vec3d(){

	};

	node get_node()
	{
		return node(x, y, z, 0, 0, 0);
	}

	vec3d operator+(vec3d const &obj)
	{
		vec3d res;
		res.x = x + obj.x;
		res.y = y + obj.y;
		res.z = y + obj.z;
		return res;
	}

	vec3d operator-(vec3d const &obj)
	{
		vec3d res;
		res.x = x - obj.x;
		res.y = y - obj.y;
		res.z = z - obj.z;
		return res;
	}

	vec3d &operator+=(vec3d const &obj)
	{
		x += obj.x;
		y += obj.y;
		z += obj.z;
		return *this;
	}

	vec3d &operator-=(vec3d const &obj)
	{
		x -= obj.x;
		y -= obj.y;
		z -= obj.z;
		return *this;
	}
};

vec3d operator/(float num, const vec3d &left)
{
	vec3d res;
	res.x = left.x / num;
	res.y = left.y / num;
	res.z = left.y / num;
	return res;
}

ostream &operator<<(ostream &os, const vec3d &pt)
{
	return os << "(" << pt.x << ", " << pt.y << ", " << pt.z << ")";
}

ostream &operator<<(ostream &os, const node &pt)
{
	return os << "(" << pt.x << ", " << pt.y << ", " << pt.z << ")";
}

struct line3d
{
	vec3d point;
	vec3d slope;

	//create a new line from the origin to point
	line3d(vec3d s)
	{
		vec3d pt(0, 0, 0);
		vec3d slp(s.x, s.y, s.z);
		point = pt;
		slope = slp;
	}

	line3d(segment *s)
	{
		node *n = s->start;
		vec3d pt(n->x, n->y, n->z);
		vec3d slp(n->vx, n->vy, n->vz);
		point = pt;
		slope = slp;
	}

	line3d(node *n, vec3d slp)
	{
		vec3d pt(n->x, n->y, n->z);
		point = pt;
		slope = slp;
	}

	line3d(vec3d pt, vec3d slp)
	{
		point = pt;
		slope = slp;
	}

	line3d(){};
};

ostream &operator<<(ostream &os, const line3d &line)
{
	return os << "[" << line.point << "," << line.slope << "]";
}

const int LESS_THAN = 0, MORE_THAN = 1;
bool check_area(line3d line, vec3d point, int compare_type)
{
	float slope = line.slope.y / line.slope.x;
	float b = -slope * point.x + point.y;

	switch (compare_type)
	{
	case LESS_THAN:
		//cout << line.point.y << " < " << slope * line.point.x + b<<std::endl;
		return line.point.y < slope * line.point.x + b;
	case MORE_THAN:
		//cout << line.point.y << " > " << slope * line.point.x + b << std::endl;
		return line.point.y > slope * line.point.x + b;
	}
}

float cached_angle = -1000000, cached_sin, cached_cos;
void rotate_vec(vec3d &vec, vec3d vec_angle);

line3d reverse_line(line3d line)
{
	vec3d pt_start = line.point,
				pt_end = line.point + line.slope;

	line3d result(pt_end, pt_start - pt_end);
	return result;
}
using namespace glm;
quat RotationBetweenVectors(vec3 start, vec3 dest)
{
	start = normalize(start);
	dest = normalize(dest);

	float cosTheta = dot(start, dest);
	vec3 rotationAxis;

	/*if (cosTheta < -1 + 0.001f) {
		// special case when vectors in opposite directions:
		// there is no "ideal" rotation axis
		// So guess one; any will do as long as it's perpendicular to start
		rotationAxis = cross(vec3(0.0f, 0.0f, 1.0f), start);
		if (gtx::norm::length2(rotationAxis) < 0.01) // bad luck, they were parallel, try again!
			rotationAxis = cross(vec3(1.0f, 0.0f, 0.0f), start);

		rotationAxis = normalize(rotationAxis);
		return gtx::quaternion::angleAxis(glm::radians(180.0f), rotationAxis);
	}*/

	rotationAxis = cross(start, dest);

	float s = sqrt((1 + cosTheta) * 2);
	float invs = 1 / s;

	return quat(
			s * 0.5f,
			rotationAxis.x * invs,
			rotationAxis.y * invs,
			rotationAxis.z * invs);
}

#include "glm/gtc/type_ptr.hpp"
//http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-17-quaternions/
glm::vec3 qRotatetoGlobal(glm::vec3 point, glm::vec3 rotate)
{
	vec3 base_vec(0, 0, 1);
	quat rot_quad = RotationBetweenVectors(base_vec, rotate);
	return rot_quad * point;
}

glm::vec3 qRotatetoLocal(glm::vec3 point, glm::vec3 rotate)
{
	vec3 base_vec(0, 0, 1);
	quat rot_quad = RotationBetweenVectors(rotate, base_vec);
	return rot_quad * point;
}

//https://stackoverflow.com/questions/30928977/is-it-possible-to-rotate-a-vector-in-3d-space-using-quaternions-only
/*glm::vec3 qRotate(glm::vec3 point, glm::vec3 rotate){
	//Create quaternion.
	float pitch = atan(sqrt(rotate.x * rotate.x + rotate.y * rotate.y) / rotate.z),
		yaw = atan(rotate.x / (-rotate.y))
		, roll = 0;
	glm::vec3 EulerAngles(pitch, yaw, 0);
	glm::quat orientation = glm::quat(EulerAngles);//glm::quat(rotate);

	//Normalize
	
	orientation = glm::normalize(orientation);
	glm::vec3 alpha = orientation * point;
//	printf("\nResult2 = %f %f %f", alpha.x, alpha.y, alpha.z);
	return alpha;
}*/

glm::vec3 qRotate2(glm::vec3 point, glm::vec3 rotate)
{
	//Create quaternion.
	glm::quat orientation = glm::quat(rotate);
	orientation = glm::inverse(orientation);
	//Normalize
	orientation = glm::normalize(orientation);

	/*Method 2 - just apply the orientation to the point.*/
	glm::vec3 alpha = orientation * point;
	//	printf("\nResult2 = %f %f %f", alpha.x, alpha.y, alpha.z);
	return alpha;
}

int doRotate = 1;

vec3d local_2_global(line3d ref_line, vec3d input)
{

	//https://gamedev.stackexchange.com/questions/34076/global-transform-to-local-transform
	vec3d slope = ref_line.slope;
	glm::vec3 line_dir_pt(slope.x, slope.y, slope.z);

	glm::vec3 rotated_global_pt;
	if (doRotate)
		rotated_global_pt = qRotatetoGlobal(glm::vec3(input.x, input.y, input.z), line_dir_pt);
	else
		rotated_global_pt = glm::vec3(input.x, input.y, input.z);
	float abs_x = rotated_global_pt.x + ref_line.point.x;
	float abs_y = rotated_global_pt.y + ref_line.point.y;
	float abs_z = rotated_global_pt.z + ref_line.point.z;

	return vec3d(abs_x, abs_y, abs_z); // vec3d(rotated_global_pt.x, rotated_global_pt.y, rotated_global_pt.z);
																		 //return vec3d(abs_pt.x, abs_pt.y, abs_pt.z);
}

vec3d global_2_local(line3d ref_line, vec3d input)
{
	//https://gamedev.stackexchange.com/questions/34076/global-transform-to-local-transform
	float relative_x = input.x - ref_line.point.x;
	float relative_y = input.y - ref_line.point.y;
	float relative_z = input.z - ref_line.point.z;
	glm::vec3 rel_pt(relative_x, relative_y, relative_z);
	vec3d slope = ref_line.slope;
	glm::vec3 line_dir_pt(slope.x, slope.y, slope.z);

	glm::vec3 rotated_local_pt = qRotatetoLocal(rel_pt, line_dir_pt);
	return vec3d(rotated_local_pt.x, rotated_local_pt.y, rotated_local_pt.z);
	/*
	glm::vec3 const up(0.f, 1.f, 0.f);
	glm::vec3 global_pt(input.x, input.y, input.z);
	glm::vec3 rel_pt(relative_x, relative_y, relative_z);
	glm::quat global_dir_to_point = glm::quatLookAt(global_pt,up);

	vec3d slope = ref_line.slope;
	glm::vec3 line_dir_pt(slope.x, slope.y, slope.z);
	glm::quat line_dir = glm::quatLookAt(line_dir_pt, up);

	glm::quat local_rotation = rel_pt * glm::conjugate(line_dir);
	glm::mat4 RotationMatrix = glm::toMat4(local_rotation);

	glm::rotate(RotationMatrix, rel_pt);
	*/
}
/*
void global_2_local_line(line3d ref_line, line3d & input) {
	vec3d point, point2(input.point.x + input.slope.x, input.point.y + input.slope.y);
	point = global_2_local(ref_line, input.point);
	point2 = global_2_local(ref_line, point2);

	input.point = point;
	input.slope = *(new vec3d(point2.x - point.x, point2.y - point.y));
}*/

/*
vec2d global_2_local(line2d ref_line, vec2d input) {
	std::cout << "Input: " << input << " ref: " << ref_line;
	float relative_x = input.x - ref_line.point.x;
	float relative_y = input.y - ref_line.point.y;
	float angle = atan2(ref_line.slope.y, ref_line.slope.x);
	if (angle < 0)
		angle += 2. * PI;
	vec2d result(cos(-angle) * relative_x - sin(-angle) * relative_y, cos(-angle) * relative_y - sin(-angle) * relative_x);
	std::cout << " result: " << result << std::endl;
	return result;
}

vec2d global_2_local(line2d ref_line, vec2d input) {
	//std::cout << "Input: " << input << " ref: " << reference_pt;
	float relative_x = input.x - reference_pt.x;
	float relative_y = input.y - reference_pt.y;
	float angle = atan2(reference_pt.y, reference_pt.x);
	vec2d result(cos(-angle) * relative_x - sin(-angle) * relative_y, cos(-angle) * relative_y - sin(-angle) * relative_x);
	//std::cout << " result: " << result << std::endl;
	return result;
}

void global_2_local_line(vec2d reference_pt, line2d & input) {
	vec2d pt_start = input.point;
	//mem leak :P
	vec2d * pt_end = new vec2d(input.point.x + input.slope.x, input.point.y + input.slope.y);

	input.point = global_2_local(reference_pt, pt_start);
	vec2d pt_slope = global_2_local(reference_pt, *pt_end);
	//new slope
	pt_end = new vec2d(pt_slope.x - input.point.x, pt_slope.y - input.point.y);
	input.slope = *pt_end;

	//no more leak?
	delete pt_end;
}*/

/*
vec3d global_2_local_bu(vec3d reference_pt, vec3d input) {
	float dot = reference_pt.x * 1 + reference_pt.y * 0;
	float det = reference_pt.x * 0 - reference_pt.y * 1;
	float angle = atan2(dot,det);
	//float angle =atan2(reference_pt.y, reference_pt.x);
	if (angle != cached_angle) {
		cached_angle = angle;
		cached_sin = sin(angle);
		cached_cos = cos(angle);
	}

	float x2 = input.x, x1 = reference_pt.x, y2 = input.y, y1 = reference_pt.y;
	vec3d result((x2 - x1) * cached_cos + (y2 - y1) * cached_sin, -(x2 - x1) * cached_sin + (y2 - y1) * cached_cos);

	return result;
}*/

void rotate_vec(vec3d &vec, float angle)
{
	float theta = angle;
	//std::cout <<"rotate "<< theta_old * (180.0 / 3.141592653589793238463) << " by ";
	//std::cout << theta * (180.0 / 3.141592653589793238463) <<" = " ;
	float cs = cos(theta);
	float sn = sin(theta);
	float px = vec.x * cs - vec.y * sn;
	float py = vec.x * sn + vec.y * cs;

	vec.x = px;
	vec.y = py;

	float theta_new = atan2(vec.y, vec.x);
	//std::cout << theta_new * (180.0 / 3.141592653589793238463) << std::endl;
}

void rotate_vec(vec3d &vec, vec3d vec_angle)
{
	float theta = atan2(vec_angle.y, vec_angle.x),
				theta_old = atan2(vec.y, vec.x);
	//std::cout <<"rotate "<< theta_old * (180.0 / 3.141592653589793238463) << " by ";
	//std::cout << theta * (180.0 / 3.141592653589793238463) <<" = " ;
	float cs = cos(theta);
	float sn = sin(theta);
	float px = vec.x * cs - vec.y * sn;
	float py = vec.x * sn + vec.y * cs;

	vec.x = px;
	vec.y = py;

	float theta_new = atan2(vec.y, vec.x);
	//std::cout << theta_new * (180.0 / 3.141592653589793238463) << std::endl;
}

void set_neighbor(segment *a, segment *b, int dir)
{
	edge_cell cell; //{ 1, 0 };
	cell.is_edge = 1;
	m_edges->set(cell, a->global_index + 1, b->global_index + 1);
	m_edges->set(cell, b->global_index + 1, a->global_index + 1);

	neighbor *n = new neighbor;
	n->direction = dir;
	n->seg = b;
	a->neighbors.push_back(n);
	/*
	neighbor* n2 = new neighbor;
	n->direction = dir;
	n2->seg = a;
	b->neighbors.push_back(n2);
	*/
}

const float sqrt2 = sqrt(2.0), cos_neg_45 = 0.70710678, sin_neg_45 = -0.70710678;
const float SEARCH_LENGTH = 0.4;

/*
void draw_seg_search(segment* s) {
	int count = 0;
	const float deg_45 = 0.785398, deg_neg_45 = -deg_45, deg_135 = 2.35619, deg_neg_135 = -deg_135;
	vec3d angle_forward_left(cos(deg_neg_45), sin(deg_neg_45)), angle_forward_right(cos(deg_45), sin(deg_45)),
		angle_backward_left(cos(deg_neg_135), sin(deg_neg_135)), angle_backward_right(cos(deg_135), sin(deg_135)), swap;


	swap = angle_forward_left;
	angle_forward_left = angle_forward_right;
	angle_forward_right = swap;

	swap = angle_backward_left;
	angle_backward_left = angle_backward_right;
	angle_backward_right = swap;


	vec3d vec_slope(s->start->vx, s->start->vy);
	rotate_vec(angle_forward_left, vec_slope);
	rotate_vec(angle_forward_right, vec_slope);
	rotate_vec(angle_backward_left, vec_slope);
	rotate_vec(angle_backward_right, vec_slope);

	//line2d forward_left(s->start, angle_forward_left), forward_right(s->start, angle_forward_right),
	//	backward_left(s->end, angle_backward_left), backward_right(s->end, angle_backward_right),
	//	center_line(s->start, *(new vec2d(s->end->vx, s->end->vy)));

	line3d forward_left(s->end, angle_forward_right), forward_right(s->end, angle_forward_left),
		backward_left(s->start, angle_backward_right), backward_right(s->start, angle_backward_left),
		center_line(s->start, *(new vec3d(s->start->vx, s->start->vy)));

	if (show_search_fl)
		draw_line2d(forward_left,0);
	if (show_search_fr)
		draw_line2d(forward_right,1);
	if (show_search_bl)
		draw_line2d(backward_left,2);
	if (show_search_br)
		draw_line2d(backward_right,3);
	if (show_search_center)
		draw_line2d(center_line, 4);
}*/

#include <chrono>

vec3d *search_vectors = nullptr;
vec3d base_seg;
bool *sections_active;

int rad2deg(float rad)
{
	float degrees = 180 * rad / PI; //degrees
	return (int)(360. + degrees) % 360;
}

void init_search_vectors()
{
	cout << "INIT STARTED" << endl;
	base_seg = vec3d(0, 0, SL_LENGTH);

	if (search_vectors != nullptr)
	{
		cout << "CALLED!!!!" << endl;
		delete[] search_vectors;
	}

	search_vectors = new vec3d[search_sections * 2 + 1];
	sections_active = new bool[search_sections * 2 + 1];

	int sections = search_sections;
	float increment = PI / sections;
	vec3d *point = new vec3d(SL_LENGTH, 0, 0);
	for (int i = 0; i <= sections * 2; i++)
	{
		if (i > 0)
			rotate_vec(*point, increment);
		search_vectors[i] = *point;
		float angle = atan2(point->y, point->x);
		cout << "search vec #" << i << ": " << rad2deg(angle) << endl;
	}

	cout << "DONE" << endl;
}

int get_quadrant(vec3d point)
{
	if (point.x > 0 && point.y > 0)
		return 1;
	if (point.x < 0 && point.y > 0)
		return 2;
	if (point.x < 0 && point.y < 0)
		return 3;
	if (point.x > 0 && point.y < 0)
		return 4;
	cout << " error: " << point.x << ", " << point.y << endl;
	return -1;
}

int find_neighbor2(segment *s)
{
	vec3d forward,
			backward;
	segment *sections_result = new segment[search_sections];

	float forward_dis = -1, backward_dis = -1,
				*section_dis = new float[search_sections];
	int *section_counts = new int[search_sections];

	float center_x = 0, center_y = 0, center_z = SL_LENGTH / 2;
	int counter = 0;

	//for each search section
	for (int search_index = 0; search_index < search_sections; search_index++)
	{
		line3d first = line3d(search_vectors[search_index]), second = line3d(search_vectors[search_index + 1]);
		vec3d middle = (first.slope + second.slope);
		middle.x /= 2.;
		middle.y /= 2.;
		middle.z /= 2.;
		int quadrant = get_quadrant(middle);

		section_dis[search_index] = -1;
		section_counts[search_index] = 0;

		auto results = get_segments_in_area(s->middle->x - SEARCH_LENGTH, s->middle->y - SEARCH_LENGTH, s->middle->z - SEARCH_LENGTH,
																				s->middle->x + SEARCH_LENGTH, s->middle->y + SEARCH_LENGTH, s->middle->z + SEARCH_LENGTH, s);
		//for each search segment in range
		for (int ss = 0; ss < results.size(); ss++)
		{
			segment *s_search = results[ss];
			//cout << "[====]";
			line3d origin_line = line3d(s_search);
			//each start, middle, end nodes
			for (int t = 0; t < 3; t++)
			{
				float search_x, search_y, search_z;
				switch (t)
				{
				case 0:
					search_x = s_search->start->x;
					search_y = s_search->start->y;
					search_z = s_search->start->z;

					break;
				case 1:
					search_x = s_search->middle->x;
					search_y = s_search->middle->y;
					search_z = s_search->middle->z;
					break;
				case 2:
					search_x = s_search->end->x;
					search_y = s_search->end->y;
					search_z = s_search->end->z;
					break;
				}

				vec3d search_pt(search_x, search_y, search_z);
				search_pt = global_2_local(origin_line, search_pt);

				//point not in the same quadrant, skip!
				if (get_quadrant(search_pt) != quadrant)
					continue;

				line3d top, bottom;
				//check current quadrant
				switch (quadrant)
				{
				case 1:
					top = second;
					bottom = first;
					break;
				case 2:
					top = first;
					bottom = second;
					break;
				case 3:
					top = second;
					bottom = first;
					break;
				case 4:
					top = first;
					bottom = second;
					break;
				}

				if ( //check_area(top, search_pt, LESS_THAN) &&
						check_area(bottom, search_pt, MORE_THAN))
				{
					section_counts[search_index]++;
					float last_dis = section_dis[search_index];
					float dx = search_pt.x - center_x,
								dy = search_pt.y - center_y,
								dz = search_pt.z - center_z,
								cur_dis = sqrt(dx * dx + dy * dy + dz * dz);
					//no previous result, set this as first result for the section
					if (last_dis == -1)
					{
						sections_result[search_index] = *s_search;
						section_dis[search_index] = cur_dis;
						section_counts[search_index]++;
						counter++;
						continue;
					}

					if (cur_dis < last_dis)
					{
						sections_result[search_index] = *s_search;
						section_dis[search_index] = cur_dis;
						section_counts[search_index]++;
						counter++;
					}
				}
			}
		}
		if (section_dis[search_index] != -1)
			set_neighbor(s, &sections_result[search_index], search_index);
	}
	delete[] sections_result;
	delete[] section_counts;
	delete[] section_dis;

	return counter;
}
const int FORWARD_DIR = -1, BACKWARD_DIR = -2;
int find_neighbor(segment *s, segment *s_search)
{
	cout << "Check started." << endl;
	vec3d forward,
			backward;

	sections_active = new bool[search_sections * 2];

	float center_x = 0, center_y = 0, center_z = SL_LENGTH / 2;
	int counter = 0;

	float forward_dis = -1, backward_dis = -1;
	segment *backward_seg = nullptr, *forward_seg = nullptr;

	//for each search section
	for (int search_index = 0; search_index < search_sections * 2; search_index++)
	{
		sections_active[search_index] = false;

		float forward_dis = -1, backward_dis = -1,
					section_dis = -1;
		int section_counts = 0;
		segment *sections_result = nullptr;

		line3d first = line3d(search_vectors[search_index]), second = line3d(search_vectors[search_index + 1]);
		vec3d middle = (first.slope + second.slope);
		middle.x = (first.slope.x + second.slope.x) / 2.;
		middle.y = (first.slope.y + second.slope.y) / 2.;
		middle.z = (first.slope.z + second.slope.z) / 2.;
		//cout << "first: " << first << endl
		//	<< "second: " << second << endl;
		//cout << "middle: " << middle<<endl;

		//cout << "[====]";
		line3d origin_line = line3d(s);

		for (int t = 0; t < 1; t++)
		{
			float search_x, search_y, search_z;
			switch (t)
			{
			case 0:
				search_x = s_search->start->x;
				search_y = s_search->start->y;
				search_z = s_search->start->z;

				break;
			case 1:
				search_x = s_search->middle->x;
				search_y = s_search->middle->y;
				search_z = s_search->middle->z;
				break;
			case 2:
				search_x = s_search->end->x;
				search_y = s_search->end->y;
				search_z = s_search->end->z;
				break;
			}

			vec3d search_pt(search_x, search_y, search_z);
			//cout << "search pt: " << search_pt << endl;
			search_pt = global_2_local(origin_line, search_pt);
			//cout << "search pt local: " << search_pt<<endl;

			//cout << "Quadrant: " << get_quadrant(search_pt)<< " checking "<< quadrant << endl;
			//point not in the same quadrant, skip!

			line3d top, bottom;
			top = second;
			bottom = first;

			//check current quadrant
			/*switch (quadrant) {
			case 1:
				top = second;
				bottom = first;
				break;
			case 2:
				top = first;
				bottom = second;
				break;
			case 3:
				top = second;
				bottom = first;
				break;
			case 4:
				top = first;
				bottom = second;
				break;
			}*/

			float deg_top = rad2deg(atan2(top.slope.y, top.slope.x));
			float deg_bottom = rad2deg(atan2(bottom.slope.y, bottom.slope.x));
			float deg_search = rad2deg(atan2(search_pt.y, search_pt.x));
			if (deg_top == 0)
				deg_top = 360;
			/*cout << "search pt: " << search_pt<<", "<<deg_search<<endl;
			cout << "top: " << top <<", "<<deg_top<< endl;
			cout << "bottom: " << bottom <<", "<<deg_bottom<< endl;
			cout << "top: " << check_area(top, search_pt, LESS_THAN) << endl
				<< "bottom: " << check_area(bottom, search_pt, MORE_THAN) << endl;*/
			//if (check_area(top, search_pt, LESS_THAN) &&
			//	check_area(bottom, search_pt, MORE_THAN)) {
			if (deg_search > deg_bottom &&
					deg_search < deg_top)
			{
				cout << "match in section #" << search_index << endl;
				cout << "search pt: " << deg_search << endl;
				cout << "top: " << deg_top << endl;
				cout << "bottom: " << deg_bottom << endl;
				sections_active[search_index] = true;
				section_counts++;
				float last_dis = section_dis;
				float dx = search_pt.x - center_x,
							dy = search_pt.y - center_y,
							dz = search_pt.z - center_z,
							cur_dis = sqrt(dx * dx + dy * dy + dz * dz);
				if (dz > 0 && dz < SL_LENGTH)
				{
					//no previous result, set this as first result for the section
					if (last_dis == -1)
					{
						//cout << "Found!" << endl;
						sections_result = s_search;
						section_dis = cur_dis;
						//section_counts[search_index]++;
						counter++;
						continue;
					}

					if (cur_dis < last_dis)
					{
						//cout << "Replaced!" << endl;
						sections_result = s_search;
						section_dis = cur_dis;
						//section_counts[search_index]++;
						counter++;
					}
				} //check backward forward
				else if (dz < 0)
				{
					//no previous result, set this as first result for the section
					if (forward_dis == -1)
					{
						//cout << "Found!" << endl;
						forward_seg = s_search;
						forward_dis = cur_dis;
						//section_counts[search_index]++;
						counter++;
						continue;
					}

					if (cur_dis < forward_dis)
					{
						//cout << "Replaced!" << endl;
						forward_seg = s_search;
						forward_dis = cur_dis;
						//section_counts[search_index]++;
					}
				}
				else if (dz > SL_LENGTH)
				{
					//no previous result, set this as first result for the section
					if (backward_dis == -1)
					{
						//cout << "Found!" << endl;
						backward_seg = s_search;
						backward_dis = cur_dis;
						//section_counts[search_index]++;
						counter++;
						continue;
					}

					if (cur_dis < backward_dis)
					{
						//cout << "Replaced!" << endl;
						backward_seg = s_search;
						backward_dis = cur_dis;
						//section_counts[search_index]++;
					}
				}
			}
		}
		///END SEARCH

		if (section_dis != -1)
			set_neighbor(s, sections_result, search_index);
	}

	if (forward_dis != -1)
	{
		set_neighbor(s, forward_seg, FORWARD_DIR);
	}

	if (backward_dis != -1)
	{
		set_neighbor(s, forward_seg, BACKWARD_DIR);
	}

	cout << "Check ended." << endl;
	for (int a = 0; a < search_sections * 2; a++)
		cout << sections_active[a] << ", ";
	cout << endl;
	return counter;
}
segment *manual_segment = new segment;
void get_debug_segment2(segment *current)
{
	manual_segment->start->x = current->start->x;
	manual_segment->start->y = current->start->y;
	manual_segment->start->z = current->start->z;

	manual_segment->end->x = current->end->x;
	manual_segment->end->y = current->end->y;
	manual_segment->end->z = current->end->z;
	vec3d m_start = global_2_local(line3d(current), vec3d(*manual_segment->start)), m_end = global_2_local(line3d(current), vec3d(*manual_segment->end));

	m_start.x = debugA_xyz[0] + m_start.x;
	m_start.y = debugA_xyz[1] + m_start.y;
	m_start.z = debugA_xyz[2] + m_start.z;

	m_end.x = debugB_xyz[0] + m_end.x;
	m_end.y = debugB_xyz[1] + m_end.y;
	m_end.z = debugB_xyz[2] + m_end.z;

	/*node * start = new node(x1, y1, z1, vx, vy, vz),
		* middle = new node(x1 + vx / 2, y1 + vy / 2, z1 + vz / 2, vx, vy, vz),
		* end = new node(x2, y2, z2, vx, vy, vz);*/
	m_start = local_2_global(line3d(current), m_start);
	m_end = local_2_global(line3d(current), m_end);
	float vx = m_end.x - m_start.x,
				vy = m_end.y - m_start.y,
				vz = m_end.z - m_start.z;
	vec3d m_middle(m_start.x + vx / 2, m_start.y + vy / 2, m_start.z + vz / 2);

	manual_segment = new segment(m_start.get_node(), m_middle.get_node(), m_end.get_node());
}

void get_debug_segment(segment *current)
{
	float x1 = debugA_xyz[0] + current->start->x,
				y1 = debugA_xyz[1] + current->start->y,
				z1 = debugA_xyz[2] + current->start->z,

				x2 = debugB_xyz[0] + current->end->x,
				y2 = debugB_xyz[1] + current->end->y,
				z2 = debugB_xyz[2] + current->end->z,

				vx = x2 - x1,
				vy = y2 - y1,
				vz = z2 - z1;

	node *start = new node(x1, y1, z1, vx, vy, vz),
			 *middle = new node(x1 + vx / 2, y1 + vy / 2, z1 + vz / 2, vx, vy, vz),
			 *end = new node(x2, y2, z2, vx, vy, vz);
	manual_segment = new segment(start, middle, end);
}

bool check_range(float n, float a, float b)
{
	return (n >= a && n <= b);
}

//https://stackoverflow.com/questions/11406189/determine-if-angle-lies-between-2-other-angles
bool is_angle_between(int target, int angle1, int angle2)
{
	// make the angle from angle1 to angle2 to be <= 180 degrees
	int rAngle = ((angle2 - angle1) % 360 + 360) % 360;
	if (rAngle >= 180)
		std::swap(angle1, angle2);

	// check if it passes through zero
	if (angle1 <= angle2)
		return target >= angle1 && target <= angle2;
	else
		return target >= angle1 || target <= angle2;
}

//https://www.geeksforgeeks.org/program-for-point-of-intersection-of-two-lines/
#define pdd pair<double, double>
pdd lineLineIntersection(pdd A, pdd B, pdd C, pdd D)
{
	// Line AB represented as a1x + b1y = c1
	double a1 = B.second - A.second;
	double b1 = A.first - B.first;
	double c1 = a1 * (A.first) + b1 * (A.second);

	// Line CD represented as a2x + b2y = c2
	double a2 = D.second - C.second;
	double b2 = C.first - D.first;
	double c2 = a2 * (C.first) + b2 * (C.second);

	double determinant = a1 * b2 - a2 * b1;

	if (determinant == 0)
	{
		// The lines are parallel. This is simplified
		// by returning a pair of FLT_MAX
		return make_pair(FLT_MAX, FLT_MAX);
	}
	else
	{
		double x = (b2 * c1 - b1 * c2) / determinant;
		double y = (a1 * c2 - a2 * c1) / determinant;
		return make_pair(x, y);
	}
}

vec3d crude_trim(line3d line, vec3d pt)
{
	//	bool forward = (line.slope.z >= 0);
	//cout << "before trim: " << pt << endl;
	float length = sqrt(line.slope.x * line.slope.x + line.slope.y * line.slope.y + line.slope.z * line.slope.z);
	float trim_legth; //
	if (pt.z < 0)
		trim_legth = abs((pt.z / line.slope.z));
	else if (pt.z > SL_LENGTH)
		trim_legth = -abs(((pt.z - SL_LENGTH) / line.slope.z));

	vec3d result(pt.x + line.slope.x * trim_legth,
							 pt.y + line.slope.y * trim_legth,
							 pt.z + line.slope.z * trim_legth);
	//cout << "after trim: " << result << endl;
	return result;
}

int find_neighbor(segment *s)
{
	vec3d forward,
			backward;

	s->neighbors.clear();
	sections_active = new bool[search_sections * 2 - 1];

	float center_x = 0., center_y = 0., center_z = SL_LENGTH / 2.;
	int counter = 0;

	float forward_dis = -1, backward_dis = -1;
	segment *backward_seg = nullptr, *forward_seg = nullptr;

	//for each search section
	for (int search_index = 0; search_index < search_sections * 2; search_index++)
	{
		sections_active[search_index] = false;

		float section_dis = -1;
		int section_counts = 0;
		segment *sections_result = nullptr;

		line3d first = line3d(search_vectors[search_index]), second = line3d(search_vectors[search_index + 1]);

		line3d origin_line = line3d(s);

		auto results = get_segments_in_area(s->middle->x - SEARCH_LENGTH, s->middle->y - SEARCH_LENGTH, s->middle->z - SEARCH_LENGTH,
																				s->middle->x + SEARCH_LENGTH, s->middle->y + SEARCH_LENGTH, s->middle->z + SEARCH_LENGTH, s);

		get_debug_segment(s);
		results.push_back(manual_segment);
		//for each search segment in range
		for (int ss = 0; ss < results.size(); ss++)
		{
			segment *s_search = results[ss];

			vec3d search_start(s_search->start->x, s_search->start->y, s_search->start->z);
			search_start = global_2_local(origin_line, search_start);

			vec3d search_end(s_search->end->x, s_search->end->y, s_search->end->z);
			search_end = global_2_local(origin_line, search_end);

			line3d line_search = line3d(search_start,
																	vec3d(search_end.x - search_start.x,
																				search_end.y - search_start.y,
																				search_end.z - search_start.z));

			//Z range check
			if (!(check_range(search_start.z, 0, SL_LENGTH) ||
						check_range(search_end.z, 0, SL_LENGTH) ||
						(search_start.z < 0 && search_end.z > SL_LENGTH) ||
						(search_end.z < 0 && search_start.z > SL_LENGTH)))
			{
				///if (s_search == manual_segment)
				//cout << "z check failed" << endl;
				continue;
			}

			//Trim start and end to Z values
			/*if (check_range(search_start.z, 0, SL_LENGTH)) {
				if (search_end.z < 0) {

				}
				else if (search_end.z > 0) {

				}
			}*/

			//flip because trim doesn't work when segment is backwards
			if (search_start.z > SL_LENGTH || search_end.z < 0)
			{
				auto temp = search_start;
				search_start = search_end;
				search_end = temp;
			}

			if (!check_range(search_start.z, 0, SL_LENGTH))
				search_start = crude_trim(line_search, search_start);

			if (!check_range(search_end.z, 0, SL_LENGTH))
				search_end = crude_trim(line_search, search_end);

			line3d top, bottom;
			top = second;
			bottom = first;

			float deg_top = rad2deg(atan2(top.slope.y, top.slope.x));
			float deg_bottom = rad2deg(atan2(bottom.slope.y, bottom.slope.x));
			float deg_search_start = rad2deg(atan2(search_start.y, search_start.x));
			float deg_search_end = rad2deg(atan2(search_end.y, search_end.x));

			bool between_start = is_angle_between(deg_search_start, deg_top, deg_bottom),
					 between_end = is_angle_between(deg_search_end, deg_top, deg_bottom);

			if (deg_top == 0)
				deg_top = 360;

			bool search_between_top = is_angle_between(deg_top, deg_search_start, deg_search_end),
					 search_between_bottom = is_angle_between(deg_bottom, deg_search_start, deg_search_end);

			/*if (s_search == manual_segment) {
				cout << "deg top: " << deg_top << ", d s start: " << deg_search_start << ", end: " << deg_search_end << endl;
				cout << "s btw top: " << search_between_top << ", bottom: " << search_between_bottom << endl;
			}*/

			//if either search vector's points are between the two angles of the search segment
			if (search_between_top || search_between_bottom ||
					//if either degree to start node or deg to end node of search segment lies between the two search angles of the search section
					between_start || between_end)
			{
				//redefine flags as between angles formed by search vectors

				section_counts++;
				float last_dis = section_dis, cur_dis;
				//two points to check distance from
				vec3d dis_A_pt, dis_B_pt;

				//get distance
				//if the s_search passes through both search vectors, hence neither of them are between two search vectors' angles
				if (!between_start && !between_end)
				{
					pdd intersection = lineLineIntersection(pdd(top.point.x, top.point.y),
																									pdd(top.point.x + top.slope.x, top.point.y + top.slope.y),
																									pdd(search_start.x, search_start.y),
																									pdd(search_end.x, search_end.y));
					pdd intersection2 = lineLineIntersection(pdd(bottom.point.x, bottom.point.y),
																									 pdd(bottom.point.x + bottom.slope.x, bottom.point.y + bottom.slope.y),
																									 pdd(search_start.x, search_start.y),
																									 pdd(search_end.x, search_end.y));

					cur_dis = std::min(sqrt(intersection.first * intersection.first + intersection.second * intersection.second),
														 sqrt(intersection2.first * intersection2.first + intersection2.second * intersection2.second));
				}
				//if either start or end points of the search segment is inside this search section
				else if (between_start || between_end)
				{
					line3d search_vector_pt;
					vec3d s_search_pt;
					pdd intersection;

					s_search_pt = (between_start) ? search_start : search_end;
					search_vector_pt = (search_between_top) ? top : bottom;

					intersection = lineLineIntersection(pdd(search_vector_pt.point.x, search_vector_pt.point.y),
																							pdd(search_vector_pt.point.x + search_vector_pt.slope.x, search_vector_pt.point.y + search_vector_pt.slope.y),
																							pdd(s_search->start->x, s_search->start->y),
																							pdd(s_search->end->x, s_search->end->y));

					cur_dis = std::min(sqrt(intersection.first * intersection.first + intersection.second * intersection.second),
														 (double)sqrt(s_search_pt.x * s_search_pt.x + s_search_pt.y * s_search_pt.y));
				}
				//if both are inside
				else if (between_start && between_end)
				{
					cur_dis = std::min(sqrt(search_start.x * search_start.x + search_start.y * search_start.y),
														 sqrt(search_end.x * search_end.x + search_end.y * search_end.y));
				}

				sections_active[search_index] = true;
				//no previous result, set this as first result for the section
				if (last_dis == -1)
				{
					//cout << "Found!" << endl;
					sections_result = s_search;
					section_dis = cur_dis;
					//section_counts[search_index]++;
					counter++;
					continue;
				}

				if (cur_dis < last_dis)
				{
					//cout << "Replaced!" << endl;
					sections_result = s_search;
					section_dis = cur_dis;
					//section_counts[search_index]++;
					counter++;
				}
			} //check backward forward
			/*else if (dz < 0) {
				//no previous result, set this as first result for the section
				if (forward_dis == -1) {
					//cout << "Found!" << endl;
					forward_seg = s_search;
					forward_dis = cur_dis;
					//section_counts[search_index]++;
					counter++;
					continue;
				}

				if (cur_dis < forward_dis) {
					//cout << "Replaced!" << endl;
					forward_seg = s_search;
					forward_dis = cur_dis;
					//section_counts[search_index]++;
				}
			}
			else if (dz > SL_LENGTH) {
				//no previous result, set this as first result for the section
				if (backward_dis == -1) {
					//cout << "Found!" << endl;
					backward_seg = s_search;
					backward_dis = cur_dis;
					//section_counts[search_index]++;
					counter++;
					continue;
				}

				if (cur_dis < backward_dis) {
					//cout << "Replaced!" << endl;
					backward_seg = s_search;
					backward_dis = cur_dis;
					//section_counts[search_index]++;
				}
			}*/

			///END SEARCH
		}
		if (section_dis != -1)
		{
			/*if (sections_result == manual_segment)
				cout << "added in " << search_index << endl;*/
			set_neighbor(s, sections_result, search_index);
		}
	}

	if (forward_dis != -1)
	{
		set_neighbor(s, forward_seg, FORWARD_DIR);
	}

	if (backward_dis != -1)
	{
		set_neighbor(s, forward_seg, BACKWARD_DIR);
	}

	//for (int a = 0; a < search_sections * 2; a++)
	//	cout << sections_active[a] << ", ";
	//cout << endl;
	return counter;
}

int find_neighbor3(segment *s)
{
	vec3d forward,
			backward;

	s->neighbors.clear();
	sections_active = new bool[search_sections * 2 - 1];

	float center_x = 0., center_y = 0., center_z = SL_LENGTH / 2.;
	int counter = 0;

	float forward_dis = -1, backward_dis = -1;
	segment *backward_seg = nullptr, *forward_seg = nullptr;

	//for each search section
	for (int search_index = 0; search_index < search_sections * 2; search_index++)
	{
		sections_active[search_index] = false;

		float section_dis = -1;
		int section_counts = 0;
		segment *sections_result = nullptr;

		line3d first = line3d(search_vectors[search_index]), second = line3d(search_vectors[search_index + 1]);
		vec3d middle = (first.slope + second.slope);
		middle.x = (first.slope.x + second.slope.x) / 2.;
		middle.y = (first.slope.y + second.slope.y) / 2.;
		middle.z = (first.slope.z + second.slope.z) / 2.;
		//cout << "first: " << first << endl
		//	<< "second: " << second << endl;
		//cout << "middle: " << middle<<endl;

		//cout << "[====]";
		line3d origin_line = line3d(s);

		auto results = get_segments_in_area(s->middle->x - SEARCH_LENGTH, s->middle->y - SEARCH_LENGTH, s->middle->z - SEARCH_LENGTH,
																				s->middle->x + SEARCH_LENGTH, s->middle->y + SEARCH_LENGTH, s->middle->z + SEARCH_LENGTH, s);
		get_debug_segment(s);
		results.push_back(manual_segment);
		//for each search segment in range
		for (int ss = 0; ss < results.size(); ss++)
		{
			segment *s_search = results[ss];
			for (int t = 0; t < 3; t++)
			{
				float search_x, search_y, search_z;
				switch (t)
				{
				case 0:
					search_x = s_search->start->x;
					search_y = s_search->start->y;
					search_z = s_search->start->z;

					break;
				case 1:
					search_x = s_search->middle->x;
					search_y = s_search->middle->y;
					search_z = s_search->middle->z;
					break;
				case 2:
					search_x = s_search->end->x;
					search_y = s_search->end->y;
					search_z = s_search->end->z;
					break;
				}

				vec3d search_pt(search_x, search_y, search_z);
				//cout << "search pt: " << search_pt << endl;
				search_pt = global_2_local(origin_line, search_pt);
				//cout << "search pt local: " << search_pt<<endl;

				//cout << "Quadrant: " << get_quadrant(search_pt)<< " checking "<< quadrant << endl;
				//point not in the same quadrant, skip!
				if (search_pt.z < 0 || search_pt.z > SL_LENGTH)
					continue;

				line3d top, bottom;
				top = second;
				bottom = first;

				//check current quadrant
				/*switch (quadrant) {
				case 1:
					top = second;
					bottom = first;
					break;
				case 2:
					top = first;
					bottom = second;
					break;
				case 3:
					top = second;
					bottom = first;
					break;
				case 4:
					top = first;
					bottom = second;
					break;
				}*/

				float deg_top = rad2deg(atan2(top.slope.y, top.slope.x));
				float deg_bottom = rad2deg(atan2(bottom.slope.y, bottom.slope.x));
				float deg_search = rad2deg(atan2(search_pt.y, search_pt.x));
				if (deg_top == 0)
					deg_top = 360;
				/*cout << "search pt: " << search_pt<<", "<<deg_search<<endl;
				cout << "top: " << top <<", "<<deg_top<< endl;
				cout << "bottom: " << bottom <<", "<<deg_bottom<< endl;
				cout << "top: " << check_area(top, search_pt, LESS_THAN) << endl
					<< "bottom: " << check_area(bottom, search_pt, MORE_THAN) << endl;*/
				//if (check_area(top, search_pt, LESS_THAN) &&
				//	check_area(bottom, search_pt, MORE_THAN)) {
				if (deg_search > deg_bottom &&
						deg_search < deg_top)
				{

					section_counts++;
					float last_dis = section_dis;
					float dx = search_pt.x - center_x,
								dy = search_pt.y - center_y,
								dz = search_pt.z - center_z,
								cur_dis = sqrt(dx * dx + dy * dy + dz * dz);

					//if inside center regions
					if (search_pt.z > 0 && search_pt.z < SL_LENGTH)
					{
						/*if (s_search == manual_segment)
							cout << "mannual dis: " << cur_dis << endl;
						else
							cout << " other dis: " << cur_dis << endl;*/

						sections_active[search_index] = true;
						//no previous result, set this as first result for the section
						if (last_dis == -1)
						{
							//cout << "Found!" << endl;
							sections_result = s_search;
							section_dis = cur_dis;
							//section_counts[search_index]++;
							counter++;
							continue;
						}

						if (cur_dis < last_dis)
						{
							//cout << "Replaced!" << endl;
							sections_result = s_search;
							section_dis = cur_dis;
							//section_counts[search_index]++;
							counter++;
						}
					} //check backward forward
					/*else if (dz < 0) {
						//no previous result, set this as first result for the section
						if (forward_dis == -1) {
							//cout << "Found!" << endl;
							forward_seg = s_search;
							forward_dis = cur_dis;
							//section_counts[search_index]++;
							counter++;
							continue;
						}

						if (cur_dis < forward_dis) {
							//cout << "Replaced!" << endl;
							forward_seg = s_search;
							forward_dis = cur_dis;
							//section_counts[search_index]++;
						}
					}
					else if (dz > SL_LENGTH) {
						//no previous result, set this as first result for the section
						if (backward_dis == -1) {
							//cout << "Found!" << endl;
							backward_seg = s_search;
							backward_dis = cur_dis;
							//section_counts[search_index]++;
							counter++;
							continue;
						}

						if (cur_dis < backward_dis) {
							//cout << "Replaced!" << endl;
							backward_seg = s_search;
							backward_dis = cur_dis;
							//section_counts[search_index]++;
						}
					}*/
				}
			}
			///END SEARCH
		}
		if (section_dis != -1)
		{
			if (sections_result == manual_segment)
				cout << "added in " << search_index << endl;
			set_neighbor(s, sections_result, search_index);
		}
	}

	if (forward_dis != -1)
	{
		set_neighbor(s, forward_seg, FORWARD_DIR);
	}

	if (backward_dis != -1)
	{
		set_neighbor(s, forward_seg, BACKWARD_DIR);
	}

	//for (int a = 0; a < search_sections * 2; a++)
	//	cout << sections_active[a] << ", ";
	cout << endl;
	return counter;
}

/*
void draw_base_segment_test() {


	segment* s = &seg_base;

	const float deg_45 = 0.785398, deg_neg_45 = -deg_45, deg_135 = 2.35619, deg_neg_135 = -deg_135;
	vec3d angle_forward_left(cos(deg_neg_45), sin(deg_neg_45)), angle_forward_right(cos(deg_45), sin(deg_45)),
		angle_backward_left(cos(deg_neg_135), sin(deg_neg_135)), angle_backward_right(cos(deg_135), sin(deg_135));

	line3d center_line(s->middle, *(new vec3d(s->start->vx, s->start->vy))),
		origin_line = center_line;

	//float offset_x = 25, offset_y = 45;
	float offset_x = 25, offset_y = 15;//offset_x = s->middle->x + 10, offset_y = s->middle->y;

	SL_LENGTH = sqrt(center_line.slope.x * center_line.slope.x + center_line.slope.y * center_line.slope.y);
	center_line.point = *(new vec3d(offset_x - SL_LENGTH / 2, offset_y));
	center_line.slope = *(new vec3d(SL_LENGTH , 0));
	vec3d pt_start = *(new vec3d(offset_x - SL_LENGTH / 2, 0 + offset_y)),
		pt_end = *(new vec3d(offset_x + SL_LENGTH / 2, 0 + offset_y));

	line3d forward_left(pt_end, angle_forward_right), forward_right(pt_end, angle_forward_left),
		backward_left(pt_start, angle_backward_right), backward_right(pt_start, angle_backward_left);

	if (show_search_fl)
		draw_line2d(forward_left, 0);
	if (show_search_fr)
		draw_line2d(forward_right, 1);
	if (show_search_bl)
		draw_line2d(backward_left, 2);
	if (show_search_br)
		draw_line2d(backward_right, 3);
	if (show_search_center)
		draw_line2d(center_line, 4);

	for (int a = 0; a < seg_neighbors_num; a++) {
		//neighbor* n = seg_ne
		segment* s2 = &seg_neighbors[a];//n->seg;
		float rgb[3];
		rgb[0] = 0.5;
		rgb[1] = 0.5;
		rgb[2] = 0.5;
		switch (n->direction) {
		case 0: rgb[0] = 1;
			if (!show_l)
				continue;
			break;
		case 1: rgb[1] = 1;
			if (!show_r)
				continue;
			break;
		case 2: rgb[2] = 1;
			if (!show_bot)
				continue;
			break;
		case 3: rgb[0] = 1; rgb[1] = 1;
			if (!show_top)
				continue;
			break;
		}
		vec3d search_pt(s2->middle->x, s2->middle->y);
		search_pt = global_2_local(origin_line, search_pt);
		draw_line_color((offset_x) , (offset_y) , (search_pt.x + offset_x) , (search_pt.y + offset_y) , rgb);

		float yellow[3] = { 1,1,0 };
		vec3d neighbor_start(s2->start->x, s2->start->y);
		neighbor_start = global_2_local(origin_line, neighbor_start);
		vec3d neighbor_end(s2->end->x, s2->end->y);
		neighbor_end = global_2_local(origin_line, neighbor_end);
		draw_line_color((neighbor_start.x + offset_x) , (neighbor_start.y + offset_y) , (neighbor_end.x + offset_x) , (neighbor_end.y + offset_y) , yellow);
	}
}*/

void draw_neighbor_test()
{
	return;
	/*
	float yellow[3] = { 1,1,0 }, white[3] = {1,1,1};
	glColor3f(0.08, 0.08, 0.08);
	glBegin(GL_QUADS);
	glVertex2f(0, 0.5);
	glVertex2f(1, 0.5);
	glVertex2f(1, 0);
	glVertex2f(0, 0);
	glEnd();

	glColor3f(0.15, 0.15, 0.15);
	glBegin(GL_QUADS);
	glVertex2f(0, 1);
	glVertex2f(1, 1);
	glVertex2f(1, 0.5);
	glVertex2f(0, 0.5);
	glEnd();
	float offset_x = 0, offset_y = 0;
	draw_line_color((seg_base.start->x + offset_x)/50., (seg_base.start->y + offset_y) ., (seg_base.end->x + offset_x) ., (seg_base.end->y + offset_y) ., white);
	draw_seg_search(&seg_base);
	for (int a = 0; a < seg_neighbors_num; a++) {
		//neighbor* n = seg_ne
		segment s2 = seg_neighbors[a];
		draw_line_color((s2.start->x + offset_x) ., (s2.start->y + offset_y) ., (s2.end->x + offset_x) ., (s2.end->y + offset_y) ., yellow);
	}
	draw_base_segment_test();
	*/
}

int skip_lines = 1, skip_nodes = 1;

/**
 * @brief loop through all streamlines, add segment based on the GRAPH_RESOLUTION
 *
 */
void read_segments_from_sl()
{
	cout << "true: " << inRange(0.1, 0.2, 0.11) << " false: " << inRange(0.1, 0.1, 2) << endl;

	segment_num = 0;
	//clear previous segments
	for (int i = 0; i < segment_starters.size(); i++)
	{
		segment *s = segment_starters[i];
		while (s != nullptr)
		{
			delete s;
			s = s->next;
		}
	}
	segment_starters.clear();

	segment *last_s = nullptr;
	int total_nodes = 0;
	std::cout << "reading segments" << std::endl;
	for (int i = 0; i < streamlines.size(); i++)
	{
		last_s = nullptr;
		std::vector<node> *streamline = (&streamlines[i]);

		//skip if streamline only has one node
		if (streamline->size() < 2)
			continue;

		//loop through each node in sl
		for (int n = 0; n != streamline->size() - 1; n++)
		{
			//get next streamline node index based on

			//legacy graph resolution seta
			/*
			int next_n = n + GRAPH_RESOLUTION;
			if (next_n > streamline->size() - 1) {
				next_n = streamline->size() - 1;
			}*/

			segment *s = new segment;
			s->global_index = segment_num;
			segment_num++;

			if (n == 0)
				segment_starters.push_back(s);

			s->start = &(*streamline)[n];
			s->end = &(*streamline)[n + 1];

			s->streamline_index = i;
			s->streamline_segment_index = n;

			//increment node index!
			//legacy graph resolution set
			//n = next_n;

			node *n_middle = new node;
			n_middle->x = s->start->x + s->start->vx / 2.;
			n_middle->y = s->start->y + s->start->vy / 2.;
			n_middle->z = s->start->z + s->start->vz / 2.;
			n_middle->vx = s->start->vx;
			n_middle->vy = s->start->vy;
			n_middle->vz = s->start->vz;

			s->middle = n_middle;
			if (last_s != nullptr)
			{
				s->previous = last_s;
				last_s->next = s;
				last_s = s;
				total_nodes++;
			}
			int binx = (int)n_middle->x % 5,
					biny = (int)n_middle->y % 5;

			//add to bin
			binx = (int)n_middle->x % bin_width_segment;
			biny = (int)n_middle->y % bin_width_segment;
			bins_segment[binx][biny].push_back(s);
			last_s = s;
		}
	}
	std::cout << "allocating matrix size " << segment_num << std::endl;
	m_edges = new SparseMatrix<edge_cell>(segment_num);
	m_edge_type = new SparseMatrix<edge_cell>(segment_num);
	std::cout << "DONE" << std::endl;

	init_search_vectors();
}
int charToint(char a)
{
	char *p = &a;
	int k = atoi(p);
	return k;
}

#include <fstream>
ofstream outfile;
/**
 * @brief loop through all segments (depend on the current segment resolution) to find their neighbors
 * 
 */
void update_graph(std::vector<std::vector<node>> &streamlines_)
{
	streamlines = streamlines_;
	std::cerr << "Updating graph" << std::endl;
	read_segments_from_sl();

	int counter = 0;
	int recur_count = 0;
	//#pragma omp parallel for
	for (int i = 0; i < segment_starters.size(); i++)
	{
		//if (i % skip_lines != 0)
		//	continue;
		segment *s = segment_starters[i];
		int node_counter = 0;

		while (s != nullptr)
		{
			recur_count++;
			//node_counter++;
			//if (node_counter % skip_nodes != 0)
			//	continue;
			//raycast_segment(s, DIR_LEFT);
			//raycast_segment(s, DIR_RIGHT);

			//add this segment as a direct edge to the matrix
			if (s->next != nullptr)
			{
				edge_cell cell; //{ 1, 0 };
				cell.is_edge = 1;
				//std::cout << s->global_index + 1 << ", " << s->next->global_index + 1 << std::endl;

				m_edges->set(cell, s->global_index + 1, s->next->global_index + 1);
				m_edges->set(cell, s->next->global_index + 1, s->global_index + 1);
			}
			//std::chrono::steady_clock::time_point begin = std::chrono::steady_clock::now();
			int count = find_neighbor(s);
			//cout << "found: " << count << endl;
			//std::chrono::steady_clock::time_point end = std::chrono::steady_clock::now();
			//std::cout << "n: "<<count<<", Time difference = " << std::chrono::duration_cast<std::chrono::microseconds>(end - begin).count() << "[µs]" << std::endl;
			s = s->next;
		}
		cerr << "recur_count: " << recur_count << endl;
		counter++;
		cerr << "Progress " << counter << "/" << segment_starters.size() << std::endl;
	}

	//update all_segments, add ALL segments
	all_segments = new segment *[segment_num];
	for (int i = 0; i < segment_starters.size(); i++)
	{
		segment *s = segment_starters[i];

		while (s != nullptr)
		{
			all_segments[s->global_index] = s;
			s = s->next;
		}
	}
	//std::cout << "Done Updating graph "<<std::endl<<c_left<<", "<<c_right<<", "<<c_top<<", "<<c_bot << std::endl;
}

float red[3] = {1, 0, 0}, blue[3] = {1, 1, 0}, gray[3] = {0.3, 0.3, 0.3}, white[3] = {1, 1, 1}, black[3] = {0, 0, 0};
const int c_red = 0, c_blue = 1;
int color = c_red;
void switch_color(float *&rgb)
{

	if (color == c_red)
	{
		color = c_blue;
		rgb = blue;
	}
	else
	{
		color = c_red;
		rgb = red;
	}
}
float IMG_SIZE = 512;

bool do_draw_matrix = false;

void compile_matrix(int notused)
{
	outfile.open("testoutput.csv");
	for (int i = 0; i < segment_num; i += 1)
	{
		segment *s1 = all_segments[i];
		if (s1->middle->x > matrix_region_x1 && s1->middle->x < matrix_region_x2 && s1->middle->y > matrix_region_y1 && s1->middle->y < matrix_region_y2 && s1->middle->z > matrix_region_z1 && s1->middle->z < matrix_region_z2)
			outfile << ", " << s1->streamline_index;
	}
	outfile << endl;

	for (int i = 0; i < segment_num; i += 1)
	{
		bool next = false;
		segment *s1 = all_segments[i];
		if (s1->middle->x > matrix_region_x1 && s1->middle->x < matrix_region_x2 && s1->middle->y > matrix_region_y1 && s1->middle->y < matrix_region_y2 && s1->middle->z > matrix_region_y1 && s1->middle->z < matrix_region_z2)
			outfile << s1->streamline_index << ", ";
		for (int a = 0; a < segment_num; a += 1)
		{
			segment *s1 = all_segments[i], *s2 = all_segments[a];
			if (s1->middle->x > matrix_region_x1 && s1->middle->x < matrix_region_x2 && s2->middle->x > matrix_region_x1 && s2->middle->x < matrix_region_x2 && s1->middle->y > matrix_region_y1 && s1->middle->y < matrix_region_y2 && s2->middle->y > matrix_region_y1 && s2->middle->y < matrix_region_y2 && s1->middle->z > matrix_region_z1 && s1->middle->z < matrix_region_z2 && s2->middle->z > matrix_region_z1 && s2->middle->z < matrix_region_z2)
			{
				outfile << m_edges->get(i + 1, a + 1) << ",";
				next = true;
			}
		}
		if (next)
			outfile << std::endl;
	}
	outfile.close();
	std::cout << "SEG SIZE " << segment_starters.size() << std::endl;
}

void get_sections_active(segment *s)
{
	sections_active = new bool[search_sections * 2];
	for (int a = 0; a < search_sections * 2; a++)
		sections_active[a] = false;

	for (int i = 0; i < s->neighbors.size(); i++)
	{
		int dir = s->neighbors[i]->direction;
		if (dir >= 0)
			sections_active[dir] = true;
	}
}

void draw_base_segment(segment *s)
{
}

void draw_global_search_vectors(segment *s)
{
}
/**
 * @brief draw segment matrix, only meant for very small resolution to confirm the accuracy of the neighbors finding algorithm
 * 
 */
void draw_segment_matrix()
{
}

segment *base_segment;

void draw_debug()
{
}

void draw_segment()
{
}

void compile_matrix_bu(int i)
{ /*

	std::vector<segment*> streamline_starts;

	//first loop to get # of streamlines, and # nodes per streamline
	segment* s = segment_starters[segment_current];
	streamline_starts.push_back(s);

	int count = 0;
	while (s != nullptr) {
		count++;
		for (int i = 0; i < s->neighbors.size(); i++) {
			neighbor* n = s->neighbors[i];
			segment* s2 = n->seg;

			segment* streamline_s = segment_starters[s2->streamline_index];
			bool found = false;
			//check if this neighbor segment's streamline index is already added
			for (int a = 0; a < streamline_starts.size(); a++) {
				if (streamline_s->streamline_index == streamline_starts[a]->streamline_index) {
					found = true;
					break;
				}
				//else
					//std::cout << streamline_s->streamline_index << ", " << streamline_starts[a]->streamline_index << ", ";
			}
			if (!found) {
				streamline_starts.push_back(streamline_s);
				std::cout << " added " << streamline_s->streamline_index << std::endl;
			}
		}
			s = s->next;
		}

		//bubble sort streamline start indexes
		for (int a = 0; a < streamline_starts.size(); a++) {
			for (int b = a + 1; b < streamline_starts.size() - 1; b++) {
				if (streamline_starts[a]->global_index > streamline_starts[b]->global_index) {
					std::swap(streamline_starts[a], streamline_starts[b]);
				}
			}
		}

		//count
		std::vector<int> s_num;
		int total_segments = 0;
		int num_current;
		for (int a = 0; a < streamline_starts.size(); a++) {
			segment* streamline_s = streamline_starts[a];
			int num = 0;
			while (streamline_s != nullptr) {
				num++;
				streamline_s = streamline_s->next;
			}
			total_segments += num;
			s_num.push_back(num);

			if (streamline_starts[a] == segment_starters[segment_current])
				num_current = num;
		}

		bool** matrix = new bool*[total_segments];
		for (int i = 0; i < total_segments; ++i) {
			matrix[i] = new bool[total_segments];
			for (int a = 0; a < total_segments; ++a) {
				matrix[i][a] = false;
			}
		}

		//compile matrix
		s = segment_starters[segment_current];

		while (s != nullptr) {
			for (int i = 0; i < s->neighbors.size(); i++) {
				neighbor* n = s->neighbors[i];
				segment* s2 = n->seg;

				segment* streamline_s = segment_starters[s2->streamline_index];

				//check if this neighbor segment's streamline index is already added
				for (int a = 0; a < streamline_starts.size(); a++) {
					if (streamline_s->streamline_index == streamline_starts[a]->streamline_index) {
						int counter_n = s_num[a];
						int offset_n = s2->global_index - streamline_s->global_index;
						int offset_current = s->global_index - segment_starters[segment_current]->global_index;
						total_segments;
						std::cout << num_current + offset_current << "," << counter_n + offset_n << std::endl;
						matrix[num_current + offset_current][counter_n + offset_n] = true;
						matrix[counter_n + offset_n][num_current + offset_current] = true;
						break;
					}
				}
			}
			s = s->next;
		}
		std::cout << "ttl: " << total_segments << std::endl;
		//write out the matrix
		std::ofstream output;
		output.open("Output.csv");
		for (int i = 0; i < total_segments; i++) {
			for (int a = 0; a < total_segments; a++) {
				output << matrix[i][a];
				if (a < total_segments - 1)
					output << ",";
			}
			if (i < total_segments - 1)
				output << std::endl;
		}
		output.close();*/
}

void draw_kdtree()
{

	std::queue<kdnode_t> kdqueue;

	kdqueue.push(kdtree.getroot());

	while (!kdqueue.empty())
	{
		kdnode_t kdn = kdqueue.front();
		kdqueue.pop();

		printf("\n val (%f, %f)", (kdn.pt)->x, (kdn.pt)->y);
		if (kdn.left)
			kdqueue.push(*(kdn.left));
		if (kdn.right)
			kdqueue.push(*(kdn.right));
	}
}