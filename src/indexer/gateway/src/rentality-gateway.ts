import { RentalityEvent as RentalityEventEvent } from "../generated/RentalityGateway/RentalityGateway"
import { RentalityEvent } from "../generated/schema"

export function handleRentalityEvent(event: RentalityEventEvent): void {
  let entity = new RentalityEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.eType = event.params.eType
  entity.internal_id = event.params.id
  entity.objectStatus = event.params.objectStatus
  entity.from = event.params.from
  entity.to = event.params.to
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
