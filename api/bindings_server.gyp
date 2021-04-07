{
  'targets': [
    {
      'target_name': 'streamlines',
      'libraries': [
        '-L/usr/lib',
        '-L/usr/lib/x86_64-linux-gnu',
        '-lvtkCommonCore-6.3',
        '-lvtkCommonDataModel-6.3',
        '-lvtkCommonExecutionModel-6.3',
        '-lvtkFiltersSources-6.3',
        '-lvtkInteractionStyle-6.3',
        '-lvtkRenderingCore-6.3',
        '-lvtkRenderingOpenGL-6.3',
        '-lvtkViewsInfovis-6.3',
        '-lvtkChartsCore-6.3',
        '-lvtkRenderingContext2D-6.3',
        '-lvtkFiltersImaging-6.3',
        '-lvtkInfovisLayout-6.3',
        '-lvtkRenderingLabel-6.3',
        '-lvtkViewsCore-6.3',
        '-lvtkInteractionWidgets-6.3',
        '-lvtkFiltersHybrid-6.3',
        '-lvtkRenderingVolume-6.3',
        '-lvtkIOExport-6.3',
        '-lvtkIOXML-6.3',
        '-lvtkIOXMLParser-6.3',
        '-lvtkIOCore-6.3',
        '-lvtkRenderingAnnotation-6.3',
        '-lvtkImagingColor-6.3',
        '-lvtkImagingGeneral-6.3',
        '-lvtkImagingSources-6.3',
        '-lvtkInfovisCore-6.3',
        '-lvtkFiltersExtraction-6.3',
        '-lvtkFiltersStatistics-6.3',
        '-lvtkImagingFourier-6.3',
        '-lvtkImagingHybrid-6.3',
        '-lvtkImagingCore-6.3',
        '-lvtkIOImage-6.3',
        '-lvtkDICOMParser-6.3',
        '-lvtkmetaio-6.3',
        '-lvtkFiltersModeling-6.3',
        '-lvtkRenderingFreeType-6.3',
        '-lvtkRenderingCore-6.3',
        '-lvtkFiltersSources-6.3',
        '-lvtkFiltersGeneral-6.3',
        '-lvtkCommonComputationalGeometry-6.3',
        '-lvtkCommonColor-6.3',
        '-lvtkFiltersGeometry-6.3',
        '-lvtkFiltersCore-6.3',
        '-lvtkCommonExecutionModel-6.3',
        '-lvtkCommonDataModel-6.3',
        '-lvtkCommonTransforms-6.3',
        '-lvtkCommonMisc-6.3',
        '-lvtkCommonMath-6.3',
        '-lvtkCommonSystem-6.3',
        '-lvtkCommonCore-6.3',
        '-lvtksys-6.3',
        '-lvtkIOGeometry-6.3',
        '-lvtkFiltersTexture-6.3',
        '-lvtkIOLegacy-6.3',
        '-lvtkRenderingAnnotation-6.3',
        '-lvtkRenderingLabel-6.3',
        '-lvtkRenderingVolumeOpenGL-6.3',
        '-lvtkRenderingContextOpenGL-6.3',
        '-lvtkRenderingLOD-6.3',
        '-lvtkIOPLY-6.3',
        '-lvtkIOParallel-6.3',
      ],
      'cflags_cc': [
        '-std=c++11',
        '-fopenmp',
      ],
      'cflags_cc!': [
        '-fno-exceptions',
        '-fno-rtti',
        '-Wunused-variable',
        '-Wsign-compare',
        '-Wunused-but-set-variable',
      ],
      'sources': [
        './addons/streamlines/api.cpp',
        './addons/streamlines/funcs.cpp',
        './addons/helpers/Steady3D.cpp',
        './addons/helpers/StreamlineTracer.cpp',
        './addons/helpers/StreamSurfaceTracer.cpp',
      ],
      'include_dirs': [
        '<!@(node -p \"require(\'node-addon-api\').include\")',
        '/usr/include/eigen3',
        '/usr/local/include/vtk-6.3',
        
        '/usr/lib/gcc/x86_64-linux-gnu/4.8/include',
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    },
  ],
}
