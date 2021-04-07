#include <string>
#include "data.h"

vtk_steady_vectorfield *parse_vtk(
    char *buffer,
    long int bufferSize);
std::string generate_streamlines(
    std::string strParams,
    vtk_steady_vectorfield *vtkData);
std::string generateStreamsurfaces(
    std::string strParams,
    vtk_steady_vectorfield *vtkData);