/*--------------------Global variables------------------------------*/
const int VELOCITY_COMPONENTS = 3; // (VX,VY,VZ) - for 2D, VZ is zero

struct vtk_steady_vectorfield
{
  bool is_error;
  std::string response;
  int *dims;
  double *spacing;
  double *origin;
  float *data_range;
  float *velocity_data;
};
