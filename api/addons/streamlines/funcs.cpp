
/* Include for Json*/
#include <json.hpp> //nlohann json library from https://github.com/nlohmann/json

#include "funcs.h"
#include <iostream>
#include <stdio.h>
#include <cassert>
#include <math.h>
#include <stdlib.h>
#include <cstring>
#include <cstdio>
#include <vector>
#include <omp.h> // For OpenMP

/*Include for streamline tracer*/
#include "../helpers/Steady3D.h"
#include "../helpers/StreamlineTracer.h"
#include "../helpers/StreamSurfaceTracer.h"
#include <cfloat>
/* Include for VTK*/
#include <vtkSmartPointer.h>
#include <vtkPolyData.h>
#include <vtkStructuredPointsReader.h>
#include <vtkStructuredPoints.h>
#include <vtkDataArray.h>
#include <vtkImageData.h>
#include <vtkPointData.h>
#include <vtkStreamTracer.h>
#include <vtkPolyDataReader.h>
#include <vtkIdTypeArray.h>
#include <vtkIdList.h>
#include <vtkFloatArray.h>

using namespace std;
using json = nlohmann::json;

/*--------------------Error messages-----------------------------*/
const string ERR_MSG_VALID_INPUT = "The input file has correct format!";
const string ERR_MSG_MEMORY = "Memory Issues!";
const string ERR_MSG_INVALID_INPUT = "The input file is invalid! Please upload a vtk structured point/grid file";
const string ERR_MSG_INVALID_VELOCITY = "The input file does not have the velocity field or the velocity field does not have 3 components.";
const string ERR_MSG_VALID_STREAMLINE_PARAMS = "The parameters are in the correct format!";
const string ERR_MSG_VALID_STREAMSURFACE_PARAMS = "The parameters are in the correct format!";

vtk_steady_vectorfield *parse_vtk(char *buffer, long int bufferSize)
{

  vtk_steady_vectorfield *vtkData = new vtk_steady_vectorfield;

  vtkData->is_error = false;
  vtkData->response = ERR_MSG_VALID_INPUT;
  vtkData->dims = new int[VELOCITY_COMPONENTS];
  vtkData->spacing = new double[VELOCITY_COMPONENTS];
  vtkData->origin = new double[VELOCITY_COMPONENTS];
  vtkData->data_range = new float[2 * VELOCITY_COMPONENTS];

  // Initialize vtkStructuredPointsReader
  vtkSmartPointer<vtkStructuredPointsReader> reader =
      vtkSmartPointer<vtkStructuredPointsReader>::New();
  reader->ReadFromInputStringOn();
  reader->SetInputString(buffer, bufferSize);
  reader->Update();

  // Verify structured grid/point VTK format
  if (!reader->IsFileStructuredGrid() && !reader->IsFileStructuredPoints())
  { // if this vtk file is not stored in a structured grid/point format
    std::cout << ERR_MSG_INVALID_INPUT.c_str() << std::endl;
    vtkData->is_error = true;
    vtkData->response = ERR_MSG_INVALID_INPUT;
    return vtkData;
  }

  vtkSmartPointer<vtkStructuredPoints> structurePoint = reader->GetOutput();

  // Get the velocity field
  vtkSmartPointer<vtkDataArray> velocity = structurePoint->GetPointData()->GetArray("velocity");

  if (!velocity)
    velocity = structurePoint->GetPointData()->GetArray("velocity_normalized");

  // Verify the velocity field
  if (!velocity)
  { // if the input file does not have the velocity field
    vtkData->is_error = true;
    vtkData->response = ERR_MSG_INVALID_VELOCITY;
    return vtkData;
  }

  // Verity the number of velocity components (VX,VY,VZ) - for 2D, VZ is zero
  if (velocity->GetNumberOfComponents() != VELOCITY_COMPONENTS)
  {
    vtkData->is_error = true;
    vtkData->response = ERR_MSG_INVALID_VELOCITY;
    return vtkData;
  }

  // Finally, we have the correct input data

  // Get dimension
  structurePoint->GetDimensions(vtkData->dims);

  // Get spacing
  structurePoint->GetSpacing(vtkData->spacing);

  // Get the origin
  structurePoint->GetOrigin(vtkData->origin);

  vtkData->data_range[0] = vtkData->origin[0];
  vtkData->data_range[2] = vtkData->origin[1];
  vtkData->data_range[4] = vtkData->origin[2];
  vtkData->data_range[1] = vtkData->origin[0] + vtkData->spacing[0] * (vtkData->dims[0] + 1);
  vtkData->data_range[3] = vtkData->origin[1] + vtkData->spacing[1] * (vtkData->dims[1] + 1);
  vtkData->data_range[5] = vtkData->origin[2] + vtkData->spacing[2] * (vtkData->dims[2] + 1);

  // Print out the description about the data domain
  std::cout << "Data origin: [" << vtkData->origin[0] << "," << vtkData->origin[1] << "," << vtkData->origin[2] << "]\n";
  std::cout << "The data dimensions: " << vtkData->dims[0] << " x " << vtkData->dims[1] << " x " << vtkData->dims[2] << std::endl;
  std::cout << "Grid Spacing: [" << vtkData->spacing[0] << "," << vtkData->spacing[1] << "," << vtkData->spacing[2] << "]\n";

  // allocate dynamic memory to store velocity values
  vtkData->velocity_data = new float[vtkData->dims[0] * vtkData->dims[1] * vtkData->dims[2] * 3];

  if (vtkData->velocity_data == nullptr)
  {

    vtkData->is_error = true;
    vtkData->response = ERR_MSG_MEMORY;
  }

  for (int k = 0; k < vtkData->dims[2]; k++)
    for (int j = 0; j < vtkData->dims[1]; j++)
      for (int i = 0; i < vtkData->dims[0]; i++)
      {
        int idx = k * vtkData->dims[1] * vtkData->dims[0] + j * vtkData->dims[0] + i;
        double *velo = velocity->GetTuple(idx);
        vtkData->velocity_data[VELOCITY_COMPONENTS * idx + 0] = velo[0];
        vtkData->velocity_data[VELOCITY_COMPONENTS * idx + 1] = velo[1];
        vtkData->velocity_data[VELOCITY_COMPONENTS * idx + 2] = velo[2];
        //std::cout<<velo[0]<<", "<<velo[1]<<", "<<velo[2]<<std::endl;
      }

  return vtkData;
}

/* Output a surface to the OBJ format. The surface is represented in the triangle mesh structure which has vertices and triangle connections*/
string outputSurfaceToOBJ(vector<Vector3f> &vertices, vector<Vector3i> &faces, vector<Vector3f> &normals)
{
  string objContent = "g object\n";

  // Output vertices
  for (int i = 0; i < vertices.size(); i++)
  {
    objContent += "v " + to_string(vertices[i](0)) + " ";
    objContent += to_string(vertices[i](1)) + " ";
    objContent += to_string(vertices[i](2)) + "\n";
  }

  // Output normals
  for (int i = 0; i < normals.size(); i++)
  {
    objContent += "vn " + to_string(normals[i](0)) + " ";
    objContent += to_string(normals[i](1)) + " ";
    objContent += to_string(normals[i](2)) + "\n";
  }

  // output faces
  for (int i = 0; i < faces.size(); i++)
  {
    objContent += "f " + to_string(faces[i](0)) + "//" + to_string(faces[i](0)) + " ";
    objContent += to_string(faces[i](1)) + "//" + to_string(faces[i](1)) + " ";
    objContent += to_string(faces[i](2)) + "//" + to_string(faces[i](2)) + "\n";
  }

  return objContent;
}

string generateStreamsurfaces(string strParams, vtk_steady_vectorfield *vtkData)
{
  json params = json::parse(strParams);
  json jsonResponse;
  int dimension_type;
  jsonResponse["is_error"] = false;
  jsonResponse["error_message"] = ERR_MSG_VALID_STREAMSURFACE_PARAMS;
  // Step 2: Initialize the steady vector field
  Steady3D vectorField;
  vectorField.setDomainDimension(vtkData->dims);
  vectorField.setOrigin(vtkData->origin);
  vectorField.setDataSpace(vtkData->spacing);
  vectorField.setDataRange(vtkData->data_range);
  vectorField.setData(vtkData->velocity_data);
  // Step 3: Initialize the streamsurface tracer
  StreamSurfaceTracer streamsurfaceTracer(vectorField);
  streamsurfaceTracer.setStepSize(params["stepsize"]);
  streamsurfaceTracer.setDivergence(params["divergent_threshold_min"], params["divergent_threshold_max"]);

  // Step 4: Get the seeding points from the input parameters
  vector<Vector3f> seedingCurve;
  int numbElements = params["seeding_points"].size();
  for (int i = 0; i < numbElements / 3; i++)
  {
    std::cout << params["seeding_points"][i * 3] << params["seeding_points"][i * 3 + 1] << params["seeding_points"][i * 3 + 2] << endl;
    seedingCurve.push_back(Vector3f(params["seeding_points"][i * 3], params["seeding_points"][i * 3 + 1], params["seeding_points"][i * 3 + 2]));
  }
  // Step 5: Generate a stream surface
  vector<Vector3f> vertices;
  vector<Vector3f> normals;
  vector<Vector3i> faces;
  if (params["direction"] == "forward")
  {
    streamsurfaceTracer.setForward(true);
    streamsurfaceTracer.trace(seedingCurve, params["length"], vertices, faces, normals);
  }
  else if (params["direction"] == "backward")
  {
    streamsurfaceTracer.setForward(false);
    streamsurfaceTracer.trace(seedingCurve, params["length"], vertices, faces, normals);
  }
  else
  {
    streamsurfaceTracer.setForward(true);
    streamsurfaceTracer.trace(seedingCurve, params["length"], vertices, faces, normals);
    streamsurfaceTracer.setForward(false);
    streamsurfaceTracer.trace(seedingCurve, params["length"], vertices, faces, normals);
  }
  // Get the attribute value for each vertices ( each point in the surface)
  float vx, vy, vz;
  vector<float> attributeValues;
  float max, min;
  if (vertices.size() == 0)
  {
    jsonResponse["is_error"] = true;
    jsonResponse["response"] = "Surface generated is empty. Increase the thresholds and try again";
    return jsonResponse.dump();
  }
  vectorField.get_vector_at(vertices[0](0), vertices[0](1), vertices[0](2), vx, vy, vz);
  float value = sqrt(vx * vx + vy * vy + vz * vz);
  max = min = value;

  for (int i = 0; i < vertices.size(); i++)
  {
    vectorField.get_vector_at(vertices[i](0), vertices[i](1), vertices[i](2), vx, vy, vz);
    float value = sqrt(vx * vx + vy * vy + vz * vz);
    attributeValues.push_back(value); // compute the velocity magnitude
    if (value > max)
      max = value;
    if (value < min)
      min = value;
  }
  string objContent = outputSurfaceToOBJ(vertices, faces, normals);
  jsonResponse["obj"] = objContent.c_str();
  jsonResponse["point_data"] = attributeValues;
  jsonResponse["point_data_max"] = max;
  jsonResponse["point_data_min"] = min;

  return jsonResponse.dump();
}

std::string generate_streamlines(std::string strParams, vtk_steady_vectorfield *vtkData)
{
  json params = json::parse(strParams);
  json jsonResponse;
  int dimension_type;

  jsonResponse["is_error"] = false;
  jsonResponse["error_message"] = ERR_MSG_VALID_STREAMLINE_PARAMS;

  if (vtkData->dims[2] > 1) // Check the data dimension
    dimension_type = 3;     //3D data
  else
    dimension_type = 2; // 2D data

  // Step 2: Initialize the steady vector field
  Steady3D vectorField;
  vectorField.setDomainDimension(vtkData->dims);
  vectorField.setOrigin(vtkData->origin);
  vectorField.setDataSpace(vtkData->spacing);
  vectorField.setDataRange(vtkData->data_range);
  vectorField.setData(vtkData->velocity_data);

  // Step 3: Initialize the streamline tracer
  StreamlineTracer streamlineTracer(vectorField);

  streamlineTracer.setStepSize(params["stepsize"]);

  // Step 4: Get the seeding points from the input parameters
  vector<Vector3f> seedingCurve;
  int numbElements = params["seeding_points"].size();
  if (dimension_type == 2)
  {
    for (int i = 0; i < numbElements / 2; i++)
    {
      seedingCurve.push_back(Vector3f(params["seeding_points"][i * 2], params["seeding_points"][i * 2 + 1], vtkData->origin[2]));
    }
  }
  else
  {
    for (int i = 0; i < numbElements / 3; i++)
    {
      seedingCurve.push_back(Vector3f(params["seeding_points"][i * 3], params["seeding_points"][i * 3 + 1], params["seeding_points"][i * 3 + 2]));
    }
  }

  // Step 5: Generate the streamline
  vector<vector<Vector3f>> allStreamlines;
  for (int i = 0; i < seedingCurve.size(); i++)
  {
    if (params["direction"] == "forward")
    {
      streamlineTracer.setForward(true);
      vector<Vector3f> streamline = streamlineTracer.trace(seedingCurve[i], params["length"]);
      allStreamlines.push_back(streamline);
    }
    else if (params["direction"] == "backward")
    {
      streamlineTracer.setForward(false);
      vector<Vector3f> streamline = streamlineTracer.trace(seedingCurve[i], params["length"]);
      allStreamlines.push_back(streamline);
    }
    else
    { // both

      // forward
      streamlineTracer.setForward(true);
      vector<Vector3f> streamline = streamlineTracer.trace(seedingCurve[i], params["length"]);
      allStreamlines.push_back(streamline);
      // backward
      streamlineTracer.setForward(false);
      streamline = streamlineTracer.trace(seedingCurve[i], params["length"]);
      allStreamlines.push_back(streamline);
    }
  }

  //Util::saveLinesToVTKFile(allStreamlines, "cylinder3d_streamline.vtk");

  // Step 6: Output the streamline to json
  vector<json> jsonStreamlines;
  float vx, vy, vz, velo;
  float min_velo = FLT_MAX, max_velo = FLT_MIN;
  for (int i = 0; i < allStreamlines.size(); i++)
  {
    json jsonLine;
    jsonLine["id"] = i;
    jsonLine["length"] = allStreamlines[i].size();
    vector<float> points;
    vector<float> point_data;

    for (int j = 0; j < allStreamlines[i].size(); j++)
    {
      points.push_back(allStreamlines[i][j](0));
      points.push_back(allStreamlines[i][j](1));
      points.push_back(allStreamlines[i][j](2));
      vectorField.get_vector_at(allStreamlines[i][j](0), allStreamlines[i][j](1), allStreamlines[i][j](2), vx, vy, vz);
      velo = sqrt(vx * vx + vy * vy + vz * vz);
      point_data.push_back(velo);
      if (velo < min_velo)
        min_velo = velo;
      if (velo > max_velo)
        max_velo = velo;
    }
    jsonLine["points"] = points;
    jsonLine["point_data"] = point_data;
    jsonStreamlines.push_back(jsonLine);
  }
  jsonResponse["streamlines"] = jsonStreamlines;

  jsonResponse["point_data_min"] = min_velo;
  jsonResponse["point_data_max"] = max_velo;

  return jsonResponse.dump();
}
/*std::string generate_streamlines(std::string strParams, vtk_steady_vectorfield *vtkData)
{
  json params = json::parse(strParams);
  json jsonResponse;
  int dimension_type;

  jsonResponse["is_error"] = false;
  jsonResponse["error_message"] = ERR_MSG_VALID_STREAMLINE_PARAMS;

  if (vtkData->dims[2] > 1) // Check the data dimension
    dimension_type = 3;     //3D data
  else
    dimension_type = 2; // 2D data

  std::cout<<"DIMENSION TYPE: "<<dimension_type<<std::endl;

  // Step 2: Initialize the steady vector field
  Steady3D vectorField;
  vectorField.setDomainDimension(vtkData->dims);
  vectorField.setOrigin(vtkData->origin);
  vectorField.setDataSpace(vtkData->spacing);
  vectorField.setDataRange(vtkData->data_range);
  vectorField.setData(vtkData->velocity_data);

  // Step 3: Initialize the streamline tracer
  StreamlineTracer streamlineTracer(vectorField);

  streamlineTracer.setStepSize(params["stepsize"]);

  // Step 4: Get the seeding points from the input parameters
  vector<Vector3f> seedingCurve;
  int numbElements = params["seeding_points"].size();
  if (dimension_type == 2)
  {
    for (int i = 0; i < numbElements / 2; i++)
    {
      seedingCurve.push_back(Vector3f(params["seeding_points"][i * 2], params["seeding_points"][i * 2 + 1], vtkData->origin[2]));
    }
  }
  else
  {
    for (int i = 0; i < numbElements / 3; i++)
    {
      seedingCurve.push_back(Vector3f(params["seeding_points"][i * 3], params["seeding_points"][i * 3 + 1], params["seeding_points"][i * 3 + 2]));
      std::cout<<"Added Seeding pt: "<< params["seeding_points"][i * 3] <<", "<<params["seeding_points"][i * 3+1]<<","<<params["seeding_points"][i * 3+2]<<std::endl;
    }
  }

  std::cout<<"PARAMS[LENGTH] = "<<params["length"]<<std::endl;
  // Step 5: Generate the streamline
  vector<vector<Vector3f>> allStreamlines;
  for (int i = 0; i < seedingCurve.size(); i++)
  {
    if (params["direction"] == "forward")
    {
      streamlineTracer.setForward(true);
      vector<Vector3f> streamline = streamlineTracer.trace(seedingCurve[i], params["length"]);
      allStreamlines.push_back(streamline);
    }
    else if (params["direction"] == "backward")
    {
      streamlineTracer.setForward(false);
      vector<Vector3f> streamline = streamlineTracer.trace(seedingCurve[i], params["length"]);
      allStreamlines.push_back(streamline);
    }
    else
    { // both

      // forward
      streamlineTracer.setForward(true);
      vector<Vector3f> streamline = streamlineTracer.trace(seedingCurve[i], params["length"]);
      allStreamlines.push_back(streamline);
      // backward
      streamlineTracer.setForward(false);
      streamline = streamlineTracer.trace(seedingCurve[i], params["length"]);
      allStreamlines.push_back(streamline);
    }
  }

  //Util::saveLinesToVTKFile(allStreamlines, "cylinder3d_streamline.vtk");

  // Step 6: Output the streamline to json
  vector<json> jsonStreamlines;
  for (int i = 0; i < allStreamlines.size(); i++)
  {
    json jsonLine;
    jsonLine["id"] = i;
    jsonLine["length"] = allStreamlines[i].size();
    vector<float> points;
    for (int j = 0; j < allStreamlines[i].size(); j++)
    {
      points.push_back(allStreamlines[i][j](0));
      points.push_back(allStreamlines[i][j](1));
      points.push_back(allStreamlines[i][j](2));
    }
    jsonLine["points"] = points;
    jsonStreamlines.push_back(jsonLine);
  }
  jsonResponse["streamlines"] = jsonStreamlines;

  return jsonResponse.dump();
}
*/