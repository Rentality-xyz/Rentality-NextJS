import HostLayout from "@/components/host/layout/hostLayout";
import { useRef, useState } from "react";

type NewCarInfo = {
  vinNumber: string;
  brand: string;
  model: string;
  releaseYear: string;
  image: string;
  name: string;
  licensePlate: string;
  state: string;
  seatsNumber:string;
  doorsNumber: string;
  fuelType: string;
  tankVolumeInGal: string;
  wheelDrive: string;
  transmission: string;
  trunkSize: string;
  color: string;
  bodyType:string;
  description: string;
  pricePerDay:string;
  distanceIncludedInMi: string;
};

export default function AddCar() {
  const emptyNewCarInfo = {
    vinNumber: "",
    brand: "",
    model: "",
    releaseYear: "",
    image: "",
    name: "",
    licensePlate: "",
    state: "",
    seatsNumber:"",
    doorsNumber: "",
    fuelType: "",
    tankVolumeInGal: "",
    wheelDrive: "",
    transmission: "",
    trunkSize: "",
    color: "",
    bodyType:"",
    description: "",
    pricePerDay:"",
    distanceIncludedInMi: "",
  };

  const [carInfoFormParams, setCarInfoFormParams] = useState<NewCarInfo>(emptyNewCarInfo)
  const saveButtonRef = useRef();

  return (
    <HostLayout>
      <div className="add-car flex flex-col px-8 pt-4">
        <div className="text-2xl">
          <strong>Add a car</strong>
        </div>
        <div className="add-car-block">
          <div className="text-lg mb-4">
            <strong>Car</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            {/* <div className="w-full grid grid-rows-1 grid-flow-row auto-rows-min"> */}
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="vinNumber">VIN number</label>
              <input
                type="text"
                placeholder="e.g. 4Y1SL65848Z411439"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    name: e.target.value,
                  })
                }
                value={carInfoFormParams.vinNumber}
              />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                placeholder="e.g. Shelby"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    brand: e.target.value,
                  })
                }
                value={carInfoFormParams.brand}
              />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <label  htmlFor="model">Model</label>
              <input
                type="text"
                placeholder="e.g. Mustang GT500"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    model: e.target.value,
                  })
                }
                value={carInfoFormParams.model}
              />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <label htmlFor="releaseYear">Year of manufacture</label>
              <input
                type="text"
                placeholder="e.g. 2023"
                onChange={(e) =>
                  setCarInfoFormParams({
                    ...carInfoFormParams,
                    releaseYear: e.target.value,
                  })
                }
                value={carInfoFormParams.releaseYear}
              />
            </div>
          </div>
        </div>
        <div className="add-car-block">
          <div className="text-lg mb-4">
            <strong>Photo</strong>
          </div>
          <button className="w-40 h-16 bg-violet-700 rounded-md">Upload</button>
          <div className="w-80 h-80 rounded-2xl mt-8 bg-gray-200"></div>
        </div>
        <div className="add-car-block">
          <div className="text-lg mb-4">
            <strong>Car Basics</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <div>Car name</div>
              <input type="text" />
            </div>
            <div className="flex flex-col">
              <div>License plate number</div>
              <input type="text" 
              placeholder="e.g. Eleanor"
              onChange={(e) =>
                setCarInfoFormParams({
                  ...carInfoFormParams,
                  name: e.target.value,
                })
              }
              value={carInfoFormParams.name}/>
            </div>
            <div className="flex flex-col">
              <div>State</div>
              <input type="text" />
            </div>
          </div>
        </div>
        <div className="add-car-block">
          <div className="text-lg  mb-4">
            <strong>Basic car details</strong>
          </div>
          {/* <div className="flex flex-col lg:flex-row"> */}
          <div className="details flex flex-wrap gap-4">
            <div className="flex flex-col w-2/5 lg:w-min">
              <div>Number of seats</div>
              <input type="text" />
            </div>
            <div className="flex flex-col w-1/2 lg:w-min">
              <div>Number of doors</div>
              <input type="text" />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <div>Fuel type</div>
              <input type="text" />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <div>Tank size</div>
              <input type="text" />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <div>Transmission</div>
              <input type="text" />
            </div>
            <div className="flex flex-col w-full lg:w-min">
              <div>Color</div>
              <input type="text" />
            </div>
          </div>
        </div>
        <div className="add-car-block">
          <div className="text-lg  mb-4">
            <strong>More about the car</strong>
          </div>
          <div className="flex flex-col">
            <input className="about-input" type="text" aria-multiline="true" />
          </div>
        </div>
        <div className="add-car-block">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <div className="text-lg mb-4">
                <strong>Price</strong>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <div>Rental price</div>
                  <input type="text" />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-lg  mb-4">
                <strong>Enabled distance</strong>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <div>Number of miles per day</div>
                  <input type="text" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="add-car-block mb-8 mt-8">
          <button className="w-40 h-16 bg-violet-700 rounded-md">Save</button>
        </div>
      </div>
    </HostLayout>
  );
}
