import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { RentalityEvent } from "../generated/RentalityGateway/RentalityGateway"

export function createRentalityEventEvent(
  eType: i32,
  id: BigInt,
  objectStatus: i32,
  from: Address,
  to: Address,
  timestamp: BigInt
): RentalityEvent {
  let rentalityEventEvent = changetype<RentalityEvent>(newMockEvent())

  rentalityEventEvent.parameters = new Array()

  rentalityEventEvent.parameters.push(
    new ethereum.EventParam(
      "eType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(eType))
    )
  )
  rentalityEventEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  rentalityEventEvent.parameters.push(
    new ethereum.EventParam(
      "objectStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(objectStatus))
    )
  )
  rentalityEventEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  rentalityEventEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  rentalityEventEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return rentalityEventEvent
}
