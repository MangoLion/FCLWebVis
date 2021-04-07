#include <json.hpp>
#include <napi.h>
#include <string>
#include "funcs.h"
#include <iostream>
#include <vector>
#include "../nguyenphan/globals.h"
#include "../nguyenphan/Graph.h"
#include <signal.h>

using json = nlohmann::json;
using namespace std;

template <class T>
vector<T> arrayToVector(T *arr, int numElem)
{
  return vector<T>(arr, arr + numElem);
}

Napi::Object API_parse_vtk(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  char *buffer = info[0].As<Napi::Buffer<char>>().Data();
  long size = info[1].As<Napi::Number>();
  std::cout << "received, data size: " << size << std::endl;
  vtk_steady_vectorfield *data = parse_vtk(buffer, size);

  Napi::Object result = Napi::Object::New(env);

  result.Set("is_error", data->is_error);
  result.Set("response", data->response);

  result.Set("dims", Napi::Buffer<int>::New(env, data->dims, VELOCITY_COMPONENTS));
  result.Set("origin", Napi::Buffer<double>::New(env, data->origin, VELOCITY_COMPONENTS));
  result.Set("spacing", Napi::Buffer<double>::New(env, data->spacing, VELOCITY_COMPONENTS));
  result.Set("data_range", Napi::Buffer<float>::New(env, data->data_range, VELOCITY_COMPONENTS * 2));
  result.Set("velocity_data", Napi::Buffer<float>::New(env,
                                                       data->velocity_data,
                                                       data->dims[0] * data->dims[1] * data->dims[2] * VELOCITY_COMPONENTS));

  json result_json;
  result_json["dims"] = arrayToVector(data->dims, VELOCITY_COMPONENTS);
  result_json["origin"] = arrayToVector(data->origin, VELOCITY_COMPONENTS);
  result_json["spacing"] = arrayToVector(data->spacing, VELOCITY_COMPONENTS);
  result_json["data_range"] = arrayToVector(data->data_range, VELOCITY_COMPONENTS * 2);
  result_json["point_data"] = arrayToVector(data->velocity_data, data->dims[0] * data->dims[1] * data->dims[2] * VELOCITY_COMPONENTS);
  result.Set("json", result_json.dump());
  std::cout << "Done parsing, returning result!" << std::endl;
  return result;
}

Napi::String API_generate_streamlines(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  std::string params = info[0].As<Napi::String>();
  Napi::Object dataObj = info[1].As<Napi::Object>();

  // Create struct that will be used when generating streamlines
  vtk_steady_vectorfield *data = new vtk_steady_vectorfield;

  // vtk_data struct references are set
  data->is_error = dataObj.Get("is_error").As<Napi::Boolean>();
  data->response = dataObj.Get("response").As<Napi::String>();
  data->dims = dataObj.Get("dims").As<Napi::Buffer<int>>().Data();
  data->spacing = dataObj.Get("spacing").As<Napi::Buffer<double>>().Data();
  data->origin = dataObj.Get("origin").As<Napi::Buffer<double>>().Data();
  data->data_range = dataObj.Get("data_range").As<Napi::Buffer<float>>().Data();
  data->velocity_data = dataObj.Get("velocity_data").As<Napi::Buffer<float>>().Data();

  std::string result = generate_streamlines(params, data);

  return Napi::String::New(env, result);
}

Napi::String API_generate_surfaces(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  std::string params = info[0].As<Napi::String>();
  Napi::Object dataObj = info[1].As<Napi::Object>();

  // Create struct that will be used when generating streamlines
  vtk_steady_vectorfield *data = new vtk_steady_vectorfield;

  // vtk_data struct references are set
  data->is_error = dataObj.Get("is_error").As<Napi::Boolean>();
  data->response = dataObj.Get("response").As<Napi::String>();
  data->dims = dataObj.Get("dims").As<Napi::Buffer<int>>().Data();
  data->spacing = dataObj.Get("spacing").As<Napi::Buffer<double>>().Data();
  data->origin = dataObj.Get("origin").As<Napi::Buffer<double>>().Data();
  data->data_range = dataObj.Get("data_range").As<Napi::Buffer<float>>().Data();
  data->velocity_data = dataObj.Get("velocity_data").As<Napi::Buffer<float>>().Data();

  std::cout << "done loading vectorfield" << endl;
  std::string result = generateStreamsurfaces(params, data);

  return Napi::String::New(env, result);
}

Napi::String API_find_neighbors(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  std::string params = info[0].As<Napi::String>();
  Napi::Object dataObj = info[1].As<Napi::Object>();

  std::vector<std::vector<node>> streamlines;
  std::cerr << "Begin reading streamlines" << endl;
  Napi::Array a = dataObj.Get("fileContent").As<Napi::Array>();
  for (int i = 0; i < a.Length(); i++)
  {
    Napi::Object streamLine = a.Get(i).ToObject();
    std::vector<node> sl;
    Napi::Array b = streamLine.Get("points").As<Napi::Array>();
    //if (i % 50 == 0)
    std::cerr
        << i << ", " << b.Length() << std::endl;

    for (int j = 3; j < b.Length() - 3; j += 3)
    {

      node *n = new node;
      n->x = b.Get(j).ToNumber().FloatValue();
      n->y = b.Get(j + 1).ToNumber().FloatValue();
      n->z = b.Get(j + 2).ToNumber().FloatValue();

      n->vx = n->x - b.Get(j - 5).ToNumber().FloatValue();
      n->vy = n->y - b.Get(j - 4).ToNumber().FloatValue();
      n->vz = n->z - b.Get(j - 3).ToNumber().FloatValue();
      sl.push_back(*n);
    }
    std::cerr << "done" << endl;
    streamlines.push_back(sl);
  }
  std::cerr << "Finish reading streamlines" << endl;
  update_graph(streamlines);
  std::string result = ""; //generate_streamlines(params, data);

  return Napi::String::New(env, result);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports["parseVTK"] = Napi::Function::New(
      env, API_parse_vtk);
  exports["generateStreamlines"] = Napi::Function::New(
      env, API_generate_streamlines);
  exports["generateSurfaces"] = Napi::Function::New(
      env, API_generate_surfaces);
  exports["findNeighbors"] = Napi::Function::New(
      env, API_find_neighbors);
  return exports;
}

NODE_API_MODULE(streamlines, Init);
