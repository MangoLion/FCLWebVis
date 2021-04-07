# Run Node Server

1. Install dependencies
  * Node dependencies defined in package.json (if node_modules already exists 'rm -rf node_modules' before this)
  #### `npm install`
  * Current C++ addon dependencies (linux). Works for kali-linux and ubuntu.
  #### `sudo apt-get install -y libeigen3-dev libomp-dev libvtk6-dev nlohmann-json-dev;`

2. Configure project based on system for C++ addons
#### `node-gyp configure`

3. Build for C++ addons
#### `node-gyp build`

4. Run server
#### `npm run server`
Root endpoint is http://localhost:8080/

#### Kill any process running on port 8080 if needed (if lsof package is installed)
kill $(lsof -t -i:8080)


# Add C++ functionality to Node
This is done via..
  * [node-addon-api](https://www.npmjs.com/package/node-addon-api): interface for building c++ addons
  * [node-gyp](https://www.npmjs.com/package/node-gyp): native c++ addon build tool
  * [bindings](https://www.npmjs.com/package/bindings): helper module for loading c++ addons

1. Create a new file and treat it as the middle man between Node and C++. For example, this type of file for the 'streamlines' addon is named 'api.cpp' under the directory ./addons/streamlines/api.cpp. If you would like to use an existing file due to adding to an existing 'task' go to step 3
2. At this time the file is created and now it is time to link it to node along with any other c++ files you would like to use. With every .cpp file that is created (not .h files) it needs to be linked to the bindings.gyp file. Since many systems are different the bindings configuration will be unique from system to system, but on linux it should relatively straight forward if you are familiar with compiling g++/gcc statements. Most of the time when compiling there are libraries that are linked along with flags. The bindings.gyp file automates this process for all the files that are needed. The file is similar to json where there are key value pairs. The starting key value pair is in the root of the object with "targets" as the key and an array "[...]" as the value:
  ```gyp
  {
    'targets': [
      ...
    ]
  }
  ```
  Inside this array are all the c++ addons defined with their specific configurations such as libraries, flags, etc. Here is an example of a addon that is already defined for a specifc 'task' (term used for this vector analysis project)
  ```gyp
  {
    'targets': [
      {
        'target_name': 'streamlines', # addon name used by Node for require statement
        'libraries': [ # all libraries that need to be linked for the c++ include statements and such
          '-L/usr/lib', # Allows the 'lib' directory files to be linked
          '-L/usr/x86_64-linux-gnu', # Same for the 'x86_64-linux-gnu' folder
          '-lvtkCommonCore-6.3', # Links a specific .so file (might be different for windows)
          ... # any other links
        ],
        'cflags_cc': [ # Compile flags
          '-std=c++11', # use c++11
          '-fopenmp', # an openmp flag
          ...
        ],
        'cflags_cc!': [ # Compile flags not to include by default (hince the '!' after 'cflags_cc')
          '-fno-exceptions',
          '-fno-rtti',
          ...
        ],
        'sources': [ # All the .cpp files needed for addon including files that are included
          # The structure of these files is as follows. In the addons folder there should be a task folder associated with each addon. In this case, there is a task folder named 'streamlines'. However, some tasks might need to share certain files so in the same root addons folder there is a folder named 'helpers' where these shared files should be placed. Even though they are shared, still include them in this 'sources' array.
          './addons/streamlines/api.cpp', # The file that is treated as the middle man between Node and C++ transfering data back and forth, serializing and deserializing, and executing C++ functions that handle the complex time critical logic the Node API is calls for
          './addons/streamlines/funcs.cpp', # The functions that handle all the complex time critical logic the Node API calls for (there can be as many as these as you would like)
          ... # any other files that are needed
        ],
        'include_dirs': [ # links the local c++ libraries for c++ addon development
          '<!@(node -p \"require(\'node-addon-api\').include\")', # This library is used to link c++ to Node (installed via 'npm install')
          '/usr/include/eigen3', # this allows the eigen3 library files to be included in c++ for any of the 'sources' files
          ... # any other c++ libraries that are needed
        ],
        'defines': [
          'NAPI_DISABLE_CPP_EXCEPTIONS', # disables c++ exceptions and treats them as pending javascript exceptions (https://nodejs.github.io/node-addon-api/class_napi_1_1_error.html)
        ]
      }
      ...
    ]
  }
  ```
3. Now that every thing is setup correctly, the 'api.cpp' needs to link to the c++ functions that you would like to use in Node. First include the library that allows this to happen.
  ```cpp
  #include <napi.h>
  // and any other includes
  ...
  ```
  Now that we can use the library, define the function that will return a valid result to Node using the node-addon-api library via it's types
  ```cpp
  ...
  Napi::String API_example_func(const Napi::CallbackInfo &info) // info is an array that contains all the arguments that are passed by Node in order from left to right
  {
    Napi::Env env = info.Env(); // this is used to link the Node API enviornment to values that are passed back
    // After this line, all the serialization / deserialization can occur as well as calling of any c++ related logic needed
    // Most c++ values and references can be passed back to node by using the Napi types (https://github.com/nodejs/node-addon-api/tree/master/doc)
    ...
    std::string result = example_func(/*any node arguments that are casted correctly to basic c++ types*/);
    return Napi::String::New(env, result); // env must best used inorder to pass this value to the correct enviornment
  }
  ... // any other functions that you would like to link to Node
  ```
  Even though we have defined the logic to be done and returned, it is still not linked to Node. This is where the Init function comes into play
  ```cpp
  Napi::Object Init(Napi::Env env, Napi::Object exports)
  {
    exports["exampleFunc"] = Napi::Function::New(
      env, API_example_func); // Notice the name of API_example_func does not matter. The key that this Napi::Function is associated with is what is used as the function name
    ...
    return exports;
  }

  // Now everything needs to be connected to Node as an addon
  // This function uses the same 'target_name' defined in the bindings.gyp file and the 'Init' function defined above to return all the exports defined within it
  NODE_API_MODULE(streamlines, Init);
  ```
  4. You have now successfully linked C++ to Node and visa-versa, but now here is where things mostlikely will go wrong. To test if all your logic is working correctly, run the command 'node-gyp config' and then 'node-gyp build' (node-gyp config only has to be ran once). Any future changes that are done will need to be recompiled via this 'node-gyp build' command. If anything was setup incorrectly above you might reach an error at this point. This might be due to a library/flag that was not defined correctly, casting (or converting to) a Napi value incorrectly, etc. If any of this occurs I would consult this node-addon-api githib [link](https://github.com/nodejs/node-addon-api/tree/master/doc) that contains all the documentation for types. For configuration of the bindings.gyp file, there are various resources out there.
  5. If all goes well and you have 'node-gyp build' successfully, now it's time to test the function. Since we are also using the 'bindings' npm package, it makes it really easy to link the C++ addon to node. We do as follows
    ```javascript
    const desiredName = require('bindings')('target_name')
    ```
    For the defined bindings file above, it would be...
    ```javascript
    const streamlines = require('bindings')('streamlines')
    ```
    Now the napi values can be called as needed (not just functions)
    ```javascript
    ...
    const addonResult = streamlines.exampleFunc()
    console.log(addonResult) // This would be a string
    ```