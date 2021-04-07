#include <string>
#include <sstream>
#include <iostream>
#include <fstream>
#include <vector>

#include "Graph.h"
#include "structures.h"
#include "globals.h"
#include "Reader.h"
#include "kdtree.h"
#include <cmath>

#include "tornado.h"
#include "bernard.h"

const int PROFILE_TORNADO = 0,
					PROFILE_BERNARD = 1;

struct profile
{
	int type;
	float step_size;
	float step;
};

profile
		profile_tornado = {PROFILE_TORNADO, 1 / 10., 1 / 5.},
		profile_bernard = {PROFILE_BERNARD, 1 / 10., 1 / 4.},
		profile_current = profile_tornado;

void change_profile(int index)
{
	switch (index)
	{
	case 0:
		profile_current = profile_tornado;
		break;
	case 1:
		profile_current = profile_bernard;
		break;
	}
}

void get_vector_field1(float x, float y, float z, float &vxp, float &vyp, float &vzp)
{
	vxp = -3 + 6. * x - 4. * x * (y + 1.) - 4. * z;
	vyp = 12. * x - 4. * x * x - 12. * z + 4. * z * z;
	vzp = 3. + 4. * x - 4. * x * (y + 1.) - 6. * z + 4. * (y + 1.) * z;
}
void get_vector_field(float x, float y, float z, float &vxp, float &vyp, float &vzp)
{
	/*x = ((x + 1) / 2) * 128;
	y = ((y + 1) / 2) * 128;
	z = ((z + 1) / 2) * 128;*/
	switch (profile_current.type)
	{
	case PROFILE_TORNADO:
		getTornadoVec(x, y, z, vxp, vyp, vzp);
		break;
	case PROFILE_BERNARD:
		getBernardVec(x, y, z, vxp, vyp, vzp);
		break;
	}
}

int SL_LIMIT = 10;
void draw_traced_sl(float x, float y, float z, float stepsize, std::vector<std::vector<node>> &streamlines)
{
	float vx, vy, vz;
	int count = 0;
	std::vector<node> streamline;

	for (int i = 0; i < SL_LIMIT; i++)
	{
		get_vector_field(x, y, z, vx, vy, vz);
		float mag = sqrt(vx * vx + vy * vy + vz * vz);

		vx = (vx / mag) * stepsize;
		vy = (vy / mag) * stepsize;
		vz = (vz / mag) * stepsize;

		node *n = new node;
		n->x = x;
		n->y = y;
		n->z = z;

		n->vx = vx;
		n->vy = vy;
		n->vz = vz;

		streamline.push_back(*n);

		//draw_line(x, y, z, x + vx, y + vy, z + vz);
		x += vx;
		y += vy;
		z += vz;

		if (x > 1 || x < -1 ||
				y > 1 || y < -1 ||
				z > 1 || z < -1)
			return;
	}
	streamlines.push_back(streamline);
}
int n_index = 0, last_added_index = 0;
void uniform_seeding(std::vector<std::vector<node>> &streamlines)
{
	gen_tornado(128, 128, 128, 1000);

	for (float xx = -1; xx <= 1; xx += profile_current.step)
	{
		for (float yy = -1; yy <= 1; yy += profile_current.step)
		{
			for (float zz = -1; zz <= 1; zz += profile_current.step)
			{
				//std::cout << step << ", " << xx << ", " << yy << ", " << zz << std::endl;
				float step_size = profile_current.step_size;
				draw_traced_sl(xx, yy, zz, step_size, streamlines);
				//draw_traced_sl(xx, yy, zz, -step_size);
			}
		}
	}
}
void trace_sample_streamline(std::vector<std::vector<node>> &streamlines)
{
	uniform_seeding(streamlines);
	update_graph(streamlines);
}

/**
 * @brief Read the streamline file, populate the streamlines vetor and put streamline nodes into bins
 * 
 * @param fname file name
 */
void read_streamline2(std::string fname)
{
	/*
	float average_step = 0;
	int nodes = 0;
	//return;
	streamlines.clear();
	std::ifstream file;
	file.open(fname);
	std::string line;
	int counter = 0,
		streamline_index = 0,
		strealine_segment_index = 0;

	int total_nodes = 0;
	int skip_line = 0, skip_node = 10;
	bool adaptive_read = false;
	//flag to add third node only, since first node has no vx vy

	while (std::getline(file, line)) {
		node* last_n = nullptr;
		skip_line++;
		int scounter = 0;
		if (skip_line % 4 != 0)
			continue;
		std::vector<node>streamline;
		std::stringstream ss(line);
		float temp;
		float dvx, dvy;
		int dvx_sign, dvy_sign;
		bool start_read = true,
			crit_point = false;
		//indicator of the sign of the last derivative value, used to detect a change in direction (+ to - or vice versa)
		int dv_sign;
		int n_index = 0, last_added_index = 0;

		//temporary save nodes between feature points, used for adaptive SL reading
		std::vector<node>node_cache;
		counter = skip_node;
		while (ss >> temp) {
			counter++;
			if (counter < skip_node) {
				continue;
			}
			
			counter = 0;

			node* n = new node();
			n->x = temp;
			ss >> n->y;
			//ignore z
			ss >> temp;
			//std::cout << n->x << "," << n->y << ", " << temp << std::endl;

			n->x *= 50.;
			n->y *= 50.;
			int binx = (int)n->x % 5,
				biny = (int)n->y % 5;


			//exclude first node since no vx vy
			if (last_n != nullptr) {
				n->vx = n->x - last_n->x;
				n->vy = n->y - last_n->y;
				if (SL_LENGTH == 0) {
					SL_LENGTH = sqrt(n->vx* n->vx+ n->vy* n->vx);
				}
				if (adaptive_read)
					if (start_read) {
						start_read = false;
						bins[binx][biny].push_back(n);
						streamline.push_back(*n);
						node_cache.push_back(*n);

						dvx = n->vx;
						dvy = n->vy;
						dvx_sign = dvx / dvx;
						dvy_sign = dvy / dvy;
					}
					else {
						dvx = n->vx - dvx;
						dvy = n->vy - dvy;
						int new_dvx_sign = dvx / dvx,
							new_dvy_sign = dvy / dvy;
						if (dvx_sign != new_dvx_sign || dvy_sign != new_dvy_sign) {
							crit_point = true;
						}

						dvx_sign = new_dvx_sign;
						dvy_sign = new_dvy_sign;
					
					}

				average_step += sqrt(n->vx * n->vx + n->vy * n->vy);
				nodes++;

				if (!adaptive_read) {
					bins[binx][biny].push_back(n);
					streamline.push_back(*n);
					point_t kdn = {n->x, n->y};
					pvec.push_back(kdn);
					
				}
				else {
					n_index++;
					node_cache.push_back(*n);
					if (crit_point) {
						std::cout << "crit!" << std::endl;
						crit_point = false;
						//add the middle node between this feature point and the last node that was added
						node* middle_n = (&node_cache[(n_index - last_added_index)/2]);
						bins[binx][biny].push_back(middle_n);
						streamline.push_back(*middle_n);

						//add this feature node
						bins[binx][biny].push_back(n);
						streamline.push_back(*n);

						last_added_index = n_index;
						node_cache.clear();
					}
				}
			}
			last_n = n;
			
		}

		//std::cout << "sscounter: " << scounter << std::endl;
		if (streamline.size() > 1) {
			streamlines.push_back(streamline);

			streamline_index++;
		}
	}
	kdtree.construct(true);
	std::cout << "total nodes: " << total_nodes << std::endl;
	file.close();
	update_graph();*/
}