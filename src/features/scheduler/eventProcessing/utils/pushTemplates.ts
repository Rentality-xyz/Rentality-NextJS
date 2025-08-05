import { CarUpdateStatus, ClaimStatus, EventType, TripStatus } from "@/model/blockchain/schemas";
import { RentalityEvent } from "../models";

export interface PushTemplate {
  title: string;
  body: string;
}

export function getPushTemplate(
  event: RentalityEvent,
  baseUrl: string
): {
  fromTemplate: PushTemplate | null;
  toTemplate: PushTemplate | null;
} {

  switch (event.eType) {
    case EventType.Car:
      switch (event.objectStatus) {
        case CarUpdateStatus.Add:
          return {
            fromTemplate: null,
            toTemplate: {
              title: "",
              body: `Car ${event.id} was listed on Rentality platform`
            },
          };
        case CarUpdateStatus.Update:
          return {
            fromTemplate: null,
            toTemplate: {
              title: "",
              body: `Car ${event.id} was updated on Rentality platform`
            },
          };
        case CarUpdateStatus.Burn:
          return {
            fromTemplate: null,
            toTemplate: {
              title: "",
              body: `Car ${event.id} was burned on Rentality platform`
            },
          };
        default:
          return { fromTemplate: null, toTemplate: null };
      }

    case EventType.Claim:
      switch (event.objectStatus) {
        case ClaimStatus.NotPaid:
          return {
            fromTemplate: {
              title: "",
              body: `You created new claim ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Someone created new claim ${event.id} for you on Rentality platform`
            },
          };
        case ClaimStatus.Cancel:
          return {
            fromTemplate: {
              title: "",
              body: `You rejected claim ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Claim ${event.id} was rejected on Rentality platform`
            },
          };
        case ClaimStatus.Paid:
          return {
            fromTemplate: {
              title: "",
              body: `You paid claim ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Claim ${event.id} was paid on Rentality platform`
            },
          };
        case ClaimStatus.Overdue:
          return {
            fromTemplate: {
              title: "",
              body: `Claim ${event.id} is overdue on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Claim ${event.id} is overdue on Rentality platform`
            },
          };
        default:
          return { fromTemplate: null, toTemplate: null };
      }

    case EventType.Trip:
      switch (event.objectStatus) {
        case TripStatus.Pending:
          return {
            fromTemplate: {
              title: "",
              body: `You created new trip ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Someone created new trip ${event.id} on Rentality platform`
            },
          };
        case TripStatus.Confirmed:
          return {
            fromTemplate: {
              title: "",
              body: `You confirmed trip ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Trip ${event.id} was confirmed by host on Rentality platform`
            },
          };
        case TripStatus.CheckedInByHost:
          return {
            fromTemplate: {
              title: "",
              body: `You checked-in for trip ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Host checked-in for trip ${event.id} on Rentality platform`
            },
          };
        case TripStatus.Started:
          return {
            fromTemplate: {
              title: "",
              body: `You started trip ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Guest started trip ${event.id} on Rentality platform`
            },
          };
        case TripStatus.CheckedOutByGuest:
          return {
            fromTemplate: {
              title: "",
              body: `You checked-out for trip ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Guest checked-out for trip ${event.id} on Rentality platform`
            },
          };
        case TripStatus.Finished:
          return {
            fromTemplate: {
              title: "",
              body: `You checked-out for trip ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Host checked-out for trip ${event.id} on Rentality platform`
            },
          };
        case TripStatus.Closed:
          return {
            fromTemplate: {
              title: "",
              body: `You finished trip ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Host finished trip ${event.id} on Rentality platform`
            },
          };
        case TripStatus.Rejected:
          return {
            fromTemplate: {
              title: "",
              body: `You rejected trip ${event.id} on Rentality platform`
            },
            toTemplate: {
              title: "",
              body: `Trip ${event.id} was rejected on Rentality platform`
            },
          };
        default:
          return { fromTemplate: null, toTemplate: null };
      }
    default:
      return { fromTemplate: null, toTemplate: null };
  }
}
