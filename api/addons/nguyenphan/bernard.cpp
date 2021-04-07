#include <iostream>
#include <stdio.h>
#include <cassert>
#include <math.h>
#include <stdlib.h>
#include <cstring>
#include <vector>

#include <fstream>
using namespace std;

/* Resolution of the uniform rectilinear grid */
const int resolutionZ = 64;
const int resolutionY = 32;
const int resolutionX = 128;

/**
 * To make the code simple, the entire dataset will be loaded in this array
* loadedData[i][j][k][0] = vx at the cell (i,j,k)
* loadedData[i][j][k][1] = vy at the cell (i,j,k)
* loadedData[i][j][k][2] = vz at the cell (i,j,k)
*/
float loadedData[resolutionX][resolutionY][resolutionZ][3];


/**
 * Find a substring in a string
 * @return a pointer to the first occurrence of searchString in the inputString
*/
const char* locateSubString(const char* inputString, const char* searchString)
{
	const char* foundLoc = strstr(inputString, searchString);
	if (foundLoc) return foundLoc + strlen(searchString);
	return inputString;
}

/**
  Read the raw Bernard data file and store in the uniform rectilinear grid array loadedData
 */
void loadBernardDataset() {

	FILE* pFile2 = fopen("bernard.raw", "rb");
	if (pFile2 == NULL) { fputs("File error", stderr); exit(1); }
	fseek(pFile2, 0L, SEEK_SET);

	//Read the data
	// - how much to read
	const size_t NumToRead = resolutionX * resolutionY * resolutionZ * 3;
	// - prepare memory; use malloc() if you're using pure C
	unsigned char* pData = new unsigned char[NumToRead];
	if (pData)
	{
		// - do it
		const size_t ActRead = fread((void*)pData, sizeof(unsigned char), NumToRead, pFile2);
		// - ok?
		if (NumToRead != ActRead)
		{
			printf("Something went wrong while reading the binary data section.\nPremature end of file?\n");
			delete[] pData;
			fclose(pFile2);
			return;
		}

		//Test: Print all data values
		//Note: Data runs x-fastest, i.e., the loop over the x-axis is the innermost
		//printf("\nPrinting all values in the same order in which they are in memory:\n");
		int Idx(0);
		float tmp[3];
		for (int k = 0; k < resolutionZ; k++)
		{
			for (int j = 0; j < resolutionY; j++)
			{
				for (int i = 0; i < resolutionX; i++)
				{
					//Note: Random access to the value (of the first component) of the grid point (i,j,k):
					// pData[((k * yDim + j) * xDim + i) * NumComponents]
					//assert(pData[((k * resolutionY + j) * resolutionX + i) * 3] == pData[Idx * 3]);
					//if (i%10 == 0)
					//	cout << i << ", " << j << ", " << k << endl;

					for (int c = 0; c < 3; c++)
					{
						tmp[c] = (float)pData[Idx * 3 + c] / 255. - 0.5;
					}
					float dist = sqrt(tmp[0] * tmp[0] + tmp[1] * tmp[1] + tmp[2] * tmp[2]);
					for (int c = 0; c < 3; c++)
					{
						loadedData[i][j][k][c] = tmp[c] / dist;
					}

					Idx++;
				}
			}
		}

		delete[] pData;

	}

	fclose(pFile2);

}



bool init = false;
void getBernardVec(float xx, float yy, float zz, float& vx, float& vy, float& vz) {
	if (!init) {
		loadBernardDataset();
		init = true;
	}
	int x = (xx + 1.) / 2. * resolutionX;
	int y = (yy + 1.) / 2. * resolutionX;
	int z = (zz + 1.) / 2. * resolutionX;

	vx = loadedData[x][y][z][0];
	vy = loadedData[x][y][z][1];
	vz = loadedData[x][y][z][2];

}