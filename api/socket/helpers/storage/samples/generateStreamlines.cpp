/*
	Generate streamlines given json input parameters and vtk_steady_vectorfield
	Sample input:
	{"direction":"both","stepsize":2,"length":100,"seeding_points":[1.5,4,3,2,3.5,2.6]}

	Sample output:
	{
		"is_error":false,
		"error_message":"The parameters are in the correct format!",
		"streamlines":[
			{
				"id":0,"length":3, "points":[0,1,2,3,4,5,6,7,8], "point_data":[0.2, 0.5, 0.7]
			},
			{
				"id":1,"length":3, "points":[0,1,2,3,4,5,6,7,8], "point_data":[0.1, 0.2, 0.3]
			}
		],
		"point_data_min":0.1,
		"point_data_max":0.7
	}
*/
string generateStreamlines(string strParams, vtk_steady_vectorfield *vtkData)
{
	json params = json::parse(strParams);
	json jsonResponse;
	int dimension_type;

	jsonResponse["is_error"] = false;
	jsonResponse["error_message"] = ERR_MSG_VALID_STREAMLINE_PARAMS;

	
	if (vtkData->dims[2] > 1) // Check the data dimension
		dimension_type = 3; //3D data
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
	if (dimension_type == 2) {
		for (int i = 0; i < numbElements / 2; i++) {
			seedingCurve.push_back(Vector3f(params["seeding_points"][i * 2], params["seeding_points"][i * 2 + 1], vtkData->origin[2]));
		}
	}
	else {
		for (int i = 0; i < numbElements / 3; i++) {
			seedingCurve.push_back(Vector3f(params["seeding_points"][i * 3], params["seeding_points"][i * 3 + 1], params["seeding_points"][i * 3 + 2]));

		}
	}

	
	// Step 5: Generate the streamline 
	vector< vector<Vector3f> > allStreamlines;
	for (int i = 0; i < seedingCurve.size(); i++) {
		if (params["direction"] == "forward") {
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
		else { // both

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
	for (int i = 0; i < allStreamlines.size(); i++){
		json jsonLine;
			jsonLine["id"] = i;
			jsonLine["length"] = allStreamlines[i].size();
			vector<float> points;
			vector<float> point_data;
			
			for (int j = 0; j < allStreamlines[i].size(); j++) {
				points.push_back(allStreamlines[i][j](0));
				points.push_back(allStreamlines[i][j](1));
				points.push_back(allStreamlines[i][j](2));
				vectorField.get_vector_at(allStreamlines[i][j](0), allStreamlines[i][j](1), allStreamlines[i][j](2), vx, vy, vz);
				velo = sqrt(vx*vx + vy * vy + vz * vz);
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