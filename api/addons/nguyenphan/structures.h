/**
 * @file structures.h
 * @brief Store the global initialization of needed structs by all cpp files
 * @version 0.1
 * @date 2020-01-18
 * 
 * @copyright Copyright (c) 2020
 * 
 */

#ifndef rec_structures
#define rec_structures
#include <vector>
struct node;
struct segment;

/*
 * @brief  store data on an adjacent node and it's vector, distance, and direction relative to the current node
 */
struct neighbor
{
	segment *seg;
	float vx, vy, angle, dist;
	int direction;
};

/**
 * @brief Simple node struct that only sture the vector value on the field
 *
 */
struct node
{
	float x, y, z, vx, vy, vz, mag, dis = 0, weight, err;
	node() {}
	node(const node &n)
	{
		x = n.x;
		y = n.y;
		z = n.z;
		vx = n.vx;
		vy = n.vy;
		vz = n.vz;
	}
	node(float x_, float y_, float z_, float vx_, float vy_, float vz_)
	{
		x = x_;
		y = y_;
		z = z_;
		vx = vx_;
		vy = vy_;
		vz = vz_;
	}
};

/**
 * @brief main unit of the graph representation, stire two streamline nodes and the list of neighboring nodes to the segment
 * 
 */
struct segment
{
	node *start = new node, *end = new node, *middle = new node;
	segment *previous = nullptr, *next = nullptr;
	int streamline_index, streamline_segment_index;
	int global_index = 0;
	std::vector<neighbor *> neighbors;

	segment() {}
	segment(node *s, node *m, node *e)
	{
		start = s;
		middle = m;
		end = e;
	}
	segment(node s, node m, node e)
	{
		start = new node(s);
		middle = new node(m);
		end = new node(e);
	}
};

/**
 * @brief a node_main is a basic struct that represents a point on the vector field. This struct
 * stores all values needed in the reconstructed field, including error values, vector value of the original vector field point, and of the reconstructed value
 * 
 */
struct node_main
{
	float x, y,
			vx_truth, vy_truth,
			vx_sl, vy_sl,
			vx_offset, vy_offset,
			vx_offset_sl, vy_offset_sl,
			err_vx_sl, err_vy_sl,
			err_vxy_sl, err_vxy_offset,
			err_vx_offset, err_vy_offset,
			mag_truth, mag_sl, mag_offset, mag_offset_sl,
			err_mag_sl, err_mag_offset,
			dir_truth, dir_sl, dir_offset, dir_offset_sl,
			err_dir_sl, err_dir_offset,
			weight = 0;
};

/**
 * @brief Used to trace LIC texture, one streamlet backward and one forward
 * 
 */
struct streamlet
{
	std::vector<node *> nodes;
	float weighted_sum = 0,
				dist, vx = 0, vy = 0,
				ttl_dist = 0;
};

struct g_vertice
{
	int streamline_index, segment_index, matrix_index;
	segment *s;
	std::vector<segment *> neighbors;
};

/**
 * @brief used to store edge info (distance, angle, ...), stored within the graph matrix. It doesn't store the two verticies it is connected with because the info is already in the matrix
 *
 */
struct indirect_edge
{
	bool is_direct;
	float dist, angle, xx, yy;
};
#endif