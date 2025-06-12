import { CarUpdateStatus, ClaimStatus, EventType, TripStatus } from "@/model/blockchain/schemas";
import { RentalityEvent } from "../models";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function getEmailTemplate(
  event: RentalityEvent,
  baseUrl: string
): {
  fromTemplate: EmailTemplate | null;
  toTemplate: EmailTemplate | null;
} {
  const eventDate = new Date(Number(event.timestamp) * 1000).toLocaleString();

  switch (event.eType) {
    case EventType.Car:
      switch (event.objectStatus) {
        case CarUpdateStatus.Add:
          return {
            fromTemplate: null,
            toTemplate: {
              subject: `Car ${event.id} was listed on Rentality platform`,
              html: `
                        <h2>Car ${event.id} was listed on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>                       
        
                      `,
              text: `Car ${event.id} was listed on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case CarUpdateStatus.Update:
          return {
            fromTemplate: null,
            toTemplate: {
              subject: `Car ${event.id} was updated on Rentality platform`,
              html: `
                        <h2>Car ${event.id} was updated on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Car ${event.id} was updated on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case CarUpdateStatus.Burn:
          return {
            fromTemplate: null,
            toTemplate: {
              subject: `Car ${event.id} was burned on Rentality platform`,
              html: `
                        <h2>Car ${event.id} was burned on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Car ${event.id} was burned on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
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
              subject: `You created new claim ${event.id} on Rentality platform`,
              html: `
                        <h2>You created new claim ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You created new claim ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Someone created new claim ${event.id} for you on Rentality platform`,
              html: `
                        <h2>Someone created new claim ${event.id} for you on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Someone created new claim ${event.id} for you on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case ClaimStatus.Cancel:
          return {
            fromTemplate: {
              subject: `You rejected claim ${event.id} on Rentality platform`,
              html: `
                        <h2>You rejected claim ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You rejected claim ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Claim ${event.id} was rejected on Rentality platform`,
              html: `
                        <h2>Claim ${event.id} was rejected on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Claim ${event.id} was rejected on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case ClaimStatus.Paid:
          return {
            fromTemplate: {
              subject: `You paid claim ${event.id} on Rentality platform`,
              html: `
                        <h2>You paid claim ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You paid claim ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Claim ${event.id} was paid on Rentality platform`,
              html: `
                        <h2>Claim ${event.id} was paid on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Claim ${event.id} was paid on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case ClaimStatus.Overdue:
          return {
            fromTemplate: {
              subject: `Claim ${event.id} is overdue on Rentality platform`,
              html: `
                        <h2>Claim ${event.id} is overdue on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Claim ${event.id} is overdue on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Claim ${event.id} is overdue on Rentality platform`,
              html: `
                        <h2>Claim ${event.id} is overdue on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Claim ${event.id} is overdue on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
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
              subject: `You created new trip ${event.id} on Rentality platform`,
              html: `
                        <h2>You created new trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You created new trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Someone created new trip ${event.id} on Rentality platform`,
              html: `
                        <h2>Someone created new trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Someone created new trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case TripStatus.Confirmed:
          return {
            fromTemplate: {
              subject: `You confirmed trip ${event.id} on Rentality platform`,
              html: `
                        <h2>You confirmed trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You confirmed trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Trip ${event.id} was confirmed by host on Rentality platform`,
              html: `
                        <h2>Trip ${event.id} was confirmed by host on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Trip ${event.id} was confirmed by host on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case TripStatus.CheckedInByHost:
          return {
            fromTemplate: {
              subject: `You checked-in for trip ${event.id} on Rentality platform`,
              html: `
                        <h2>You checked-in for trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You checked-in for trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Host checked-in for trip ${event.id} on Rentality platform`,
              html: `
                        <h2>Host checked-in for trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Host checked-in for trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case TripStatus.Started:
          return {
            fromTemplate: {
              subject: `You started trip ${event.id} on Rentality platform`,
              html: `
                        <h2>You started trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You started trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Guest started trip ${event.id} on Rentality platform`,
              html: `
                        <h2>Guest started trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Guest started trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case TripStatus.CheckedOutByGuest:
          return {
            fromTemplate: {
              subject: `You checked-out for trip ${event.id} on Rentality platform`,
              html: `
                        <h2>You checked-out for trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You checked-out for trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Guest checked-out for trip ${event.id} on Rentality platform`,
              html: `
                        <h2>Guest checked-out for trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Guest checked-out for trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case TripStatus.Finished:
          return {
            fromTemplate: {
              subject: `You checked-out for trip ${event.id} on Rentality platform`,
              html: `
                        <h2>You checked-out for trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You checked-out for trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Host checked-out for trip ${event.id} on Rentality platform`,
              html: `
                        <h2>Host checked-out for trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Host checked-out for trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case TripStatus.Closed:
          return {
            fromTemplate: {
              subject: `You finished trip ${event.id} on Rentality platform`,
              html: `
                        <h2>You finished trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You finished trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Host finished trip ${event.id} on Rentality platform`,
              html: `
                        <h2>Host finished trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Host finished trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        case TripStatus.Rejected:
          return {
            fromTemplate: {
              subject: `You rejected trip ${event.id} on Rentality platform`,
              html: `
                        <h2>You rejected trip ${event.id} on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `You rejected trip ${event.id} on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
            toTemplate: {
              subject: `Trip ${event.id} was rejected on Rentality platform`,
              html: `
                        <h2>Trip ${event.id} was rejected on Rentality platform</h2>
                        <p>Hello Rentality user,</p>
                        <p>find more details in our web 
                        <a href="${baseUrl}" target="_blank">
                          application
                        </a>
                        !</p>    
                      `,
              text: `Trip ${event.id} was rejected on Rentality platform\n\nHello Rentality user,\n\nfind more details in our web application (${baseUrl})!`,
            },
          };
        default:
          return { fromTemplate: null, toTemplate: null };
      }
    default:
      return { fromTemplate: null, toTemplate: null };
  }
}
