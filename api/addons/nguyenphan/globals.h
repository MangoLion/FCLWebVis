/**
 * @file globals.h
 * @author your name (you@domain.com)
 * @brief Stores all of the extern references to global variables that other cpp files will need.
 * Most of these references are initialized within the sample.cpp
 * @version 0.1
 * @date 2020-01-18
 * 
 * @copyright Copyright (c) 2020
 * 
 */

#ifndef vec_globals
#define vec_globals
#include "Skeleton.h"
#include "kdtree.h"
#include "structures.h"
/*extern struct node;
extern struct segment;
extern struct neighbor;
extern struct segment;
extern struct node_main;
extern struct streamlet;*/

//extern node_main **grid_main;
/*extern std::vector<std::vector<node>> streamlines;
//extern std::vector<node *> bins[5][5];
extern std::vector<segment *> segment_starters;
extern int bin_width_segment, bin_num_segment;
extern std::vector<segment *> bins_segment[2][2];
extern int segment_current;
const int IMG_RES = 512;*/
/*
extern float mag_max, mag_min, vx_min, vx_max,
    vy_min, vy_max, angle_min, angle_max, x_max, x_min, y_max, y_min,
    grid_offset_x, grid_offset_y;

extern float max_err_mag_sl, min_err_mag_sl,
    max_err_mag_offset, min_err_mag_offset,
    max_err_dir_sl, min_err_dir_sl,
    max_err_dir_offset, min_err_dir_offset,
    max_err_vx_sl, min_err_vx_sl,
    max_err_vy_sl, min_err_vy_sl,
    max_err_vx_offset, min_err_vx_offset,
    max_err_vy_offset, min_err_vy_offset,
    max_err_vxy_sl, min_err_vxy_sl;

extern int show_search_fl, show_search_fr, show_search_bl, show_search_br,
    show_top, show_bot, show_l, show_r, show_search_center, segment_offset;

extern int gridX, gridY;

extern Polyhedron *poly;

extern int do_draw_arrows, vis_option, do_draw_streamlines;

extern float matrix_region_x1, matrix_region_x2, matrix_region_y1, matrix_region_y2, matrix_region_z1, matrix_region_z2;
extern bool do_draw_matrix;

extern int GRAPH_RESOLUTION;*/

extern float SL_LENGTH;

extern segment seg_base, *seg_neighbors;
extern int seg_neighbors_num;

//extern std::vector<point_t> kdNodes;

extern KDTree kdtree;

extern int draw_base, search_sections, search_neighbor_index, doRotate;

extern float debugA_xyz[3], debugB_xyz[3];

#endif // !vec_globals
