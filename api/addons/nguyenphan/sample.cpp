#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <iostream>
#include <fstream>
// yes, I know stdio.h is not good C++, but I like the *printf()
#include <stdlib.h>
#include <ctype.h>
#include <sstream>
#include <cmath>

#define _USE_MATH_DEFINES
#include <math.h>

#ifdef WIN32
#include <windows.h>
#pragma warning(disable : 4996)
#endif

// You need to adjust the location of these header files according to your configuration

//#include <windows.h>

#include "Skeleton.h"
#include <time.h>
//#include "glui.h"

#include "structures.h"
#include "Reader.h"
#include "Graph.h"
#include "kdtree.h"
//
//
//	This is a sample OpenGL / GLUT / GLUI program
//
//	The objective is to draw a 3d object and change the color of the axes
//		with radio buttons
//
//	The left mouse button allows rotation
//	The middle mouse button allows scaling
//	The glui window allows:
//		1. The 3d object to be transformed
//		2. The projection to be changed
//		3. The color of the axes to be changed
//		4. The axes to be turned on and off
//		5. The transformations to be reset
//		6. The program to quit
//
//	Author: Joe Graphics
//

//int GRAPH_RESOLUTION = 1;
std::vector<std::vector<node>> streamlines2;
int main(int argc, char *argv[])
{
	trace_sample_streamline(streamlines2);
	// Load the model and data here
	//FILE* this_file = fopen("../models/bnoise.ply", "r");
	//poly = new Polyhedron(this_file);
	//fclose(this_file);
	//mat_ident( rotmat );

	//poly->initialize(); // initialize everything

	//poly->calc_bounding_sphere();
	//poly->calc_face_normals_and_area();
	//poly->average_normals();

	// create the display structures that will not change:

	return 0;
}
