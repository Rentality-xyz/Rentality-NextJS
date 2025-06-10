import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { RentalityEvent } from "../generated/schema"
import { RentalityEvent as RentalityEventEvent } from "../generated/RentalityGateway/RentalityGateway"
import { handleRentalityEvent } from "../src/rentality-gateway"
import { createRentalityEventEvent } from "./rentality-gateway-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let eType = 123
    let id = BigInt.fromI32(234)
    let objectStatus = 123
    let from = Address.fromString("0x0000000000000000000000000000000000000001")
    let to = Address.fromString("0x0000000000000000000000000000000000000001")
    let timestamp = BigInt.fromI32(234)
    let newRentalityEventEvent = createRentalityEventEvent(
      eType,
      id,
      objectStatus,
      from,
      to,
      timestamp
    )
    handleRentalityEvent(newRentalityEventEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("RentalityEvent created and stored", () => {
    assert.entityCount("RentalityEvent", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "RentalityEvent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "eType",
      "123"
    )
    assert.fieldEquals(
      "RentalityEvent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "objectStatus",
      "123"
    )
    assert.fieldEquals(
      "RentalityEvent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "from",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "RentalityEvent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "to",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "RentalityEvent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "timestamp",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
