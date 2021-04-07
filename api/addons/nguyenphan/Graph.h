#ifndef rec_graph
#define rec_graph
#include "structures.h"
void draw_segment();
void draw_segment_matrix();
void update_graph(std::vector<std::vector<node>> &streamlines_);
void raycast_segment(segment *s, int direction);
//std::vector<segment*>* get_segments_in_area(float x1, float y1, float x2, float y2);
std::vector<segment *> get_segments_in_area(float x1, float y1, float z1, float x2, float y2, float z2, segment *exclude);
void compile_matrix(int i);
void draw_neighbor_test();
void draw_debug();
void init_search_vectors();
#endif // !rec_graph
