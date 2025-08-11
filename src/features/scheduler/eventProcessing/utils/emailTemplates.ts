import { CarUpdateStatus, ClaimStatus, EventType, TripStatus } from "@/model/blockchain/schemas";
import { RentalityEvent } from "../models";

export interface EmailTemplate {
  subject: string;
  baseUrl: string,
  message: string,
  actionPath: string,
  actionText: string,
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
              baseUrl: baseUrl,
              message: `We’re happy to let you know that your car ${event.id} has been successfully listed on the Rentality platform.`,
              actionPath: "/host/vehicles/listings",
              actionText: "View Listing",
            },
          };
        case CarUpdateStatus.Update:
          return {
            fromTemplate: null,
            toTemplate: {
              subject: `Car ${event.id} was updated on Rentality platform`,
              baseUrl: baseUrl,
              message: `We’re happy to let you know that your car ${event.id} has been updated listed on the Rentality platform.`,
              actionPath: "/host/vehicles/listings",
              actionText: "View Listing",
            },
          };
        case CarUpdateStatus.Burn:
          return {
            fromTemplate: null,
            toTemplate: {
              subject: `Car ${event.id} was burned on Rentality platform`,
              baseUrl: baseUrl,
              message: `We’re happy to let you know that your car ${event.id} has been burned listed on the Rentality platform.`,
              actionPath: "/host/vehicles/listings",
              actionText: "View Listing",
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
              baseUrl: baseUrl,
              message: `We’ve received your claim ${event.id}. Please wait for a response.`,
              actionPath: "/host/claims",
              actionText: "View Claims"
            },
            toTemplate: {
              subject: `Someone created new claim ${event.id} for you on Rentality platform`,
              baseUrl: baseUrl,
              message: `A new claim ${event.id} has been filed involving you. Please review the details and take any necessary action.`,
              actionPath: "/guest/claims",
              actionText: "View Claims"
            },
          };
        case ClaimStatus.Cancel:
          return {
            fromTemplate: {
              subject: `You rejected claim ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `You have successfully rejected the claim ${event.id}.`,
              actionPath: "/host/claims",
              actionText: "View Claims",
            },
            toTemplate: {
              subject: `Your claim ${event.id} was rejected on Rentality platform`,
              baseUrl: baseUrl,
              message: `Unfortunately, your claim ${event.id} has been rejected by the other party.`,
              actionPath: "/guest/claims",
              actionText: "View Claims",
            },
          };
        case ClaimStatus.Paid:
          return {
            fromTemplate: {
              subject: `You paid claim ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `You have successfully paid claim ${event.id}. The other party will be notified, and the case will be marked as resolved.`,
              actionPath: "/host/claims",
              actionText: "View Claims",
            },
            toTemplate: {
              subject: `Claim ${event.id} was paid on Rentality platform`,
              baseUrl: baseUrl,
              message: `Claim ${event.id} has been successfully paid by the other party. The case is now marked as resolved.`,
              actionPath: "/guest/claims",
              actionText: "View Claims",
            },
          };
        case ClaimStatus.Overdue:
          return {
            fromTemplate: {
              subject: `Claim ${event.id} is overdue on Rentality platform`,
              baseUrl: baseUrl,
              message: `Claim ${event.id} has not been resolved within the expected timeframe.`,
              actionPath: "/host/claims",
              actionText: "View Claims",
            },
            toTemplate: {
              subject: `Claim ${event.id} is overdue on Rentality platform`,
              baseUrl: baseUrl,
              message: `Claim ${event.id} has not been resolved within the expected timeframe.`,
              actionPath: "/guest/claims",
              actionText: "View Claims",
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
              baseUrl: baseUrl,
              message: `Your trip ${event.id} has been successfully created.`,
              actionPath: "/guest/trips/booked",
              actionText: "View Trips",
            },
            toTemplate: {
              subject: `Someone created new trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `A new trip ${event.id} has been booked. Please review the trip details and prepare accordingly.`,
              actionPath: "/host/trips/booked",
              actionText: "View Trips",
            },
          };
        case TripStatus.Confirmed:
          return {
            fromTemplate: {
              subject: `You confirmed trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `You have successfully confirmed trip ${event.id}. The guest has been notified.`,
              actionPath: "/host/trips/booked",
              actionText: "View Trips",
            },
            toTemplate: {
              subject: `Trip ${event.id} was confirmed by host on Rentality platform`,
              baseUrl: baseUrl,
              message: `Good news! Your trip ${event.id} has been confirmed by the host. You can now view all the details and get ready for your journey.`,
              actionPath: "/guest/trips/booked",
              actionText: "View Trips",
            },
          };
        case TripStatus.CheckedInByHost:
          return {
            fromTemplate: {
              subject: `You checked-in for trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `You have successfully checked in for trip ${event.id}.`,
              actionPath: "/host/trips/booked",
              actionText: "View Trips",
            },
            toTemplate: {
              subject: `Host checked-in for trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `The host has checked in for trip ${event.id}. Everything is ready — you can now proceed with your part of the trip.`,
              actionPath: "/guest/trips/booked",
              actionText: "View Trips",
            },
          };
        case TripStatus.Started:
          return {
            fromTemplate: {
              subject: `You started trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `You have successfully started trip ${event.id}. Drive safely and enjoy your journey!`,
              actionPath: "/guest/trips/booked",
              actionText: "View Trips",
            },
            toTemplate: {
              subject: `Guest started trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `The guest has started trip ${event.id}.`,
              actionPath: "/host/trips/booked",
              actionText: "View Trips",
            },
          };
        case TripStatus.CheckedOutByGuest:
          return {
            fromTemplate: {
              subject: `You checked-out for trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `You have successfully checked out for trip ${event.id}. We hope everything went smoothly!`,
              actionPath: "/guest/trips/booked",
              actionText: "View Trips",
            },
            toTemplate: {
              subject: `Guest checked-out for trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `The guest has successfully checked out for trip ${event.id}. Please inspect the vehicle and confirm the completion.`,
              actionPath: "/host/trips/booked",
              actionText: "View Trips",
            },
          };
        case TripStatus.Finished:
          return {
            fromTemplate: {
              subject: `You checked-out for trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `You have successfully checked out for trip ${event.id}. Thank you for using Rentality — we hope everything went great!`,
              actionPath: "/host/trips/booked",
              actionText: "View Trips",
            },
            toTemplate: {
              subject: `Host checked-out for trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `The host has successfully checked out for trip ${event.id}.`,
              actionPath: "/guest/trips/booked",
              actionText: "View Trips",
            },
          };
        case TripStatus.Closed:
          return {
            fromTemplate: {
              subject: `You finished trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `You have successfully finished trip ${event.id}. Thank you for using Rentality — we hope to see you again soon!`,
              actionPath: "/host/trips/booked",
              actionText: "View Trips",
            },
            toTemplate: {
              subject: `Host finished trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `The host has finished trip ${event.id}.`,
              actionPath: "/guest/trips/booked",
              actionText: "View Trips",
            },
          };
        case TripStatus.Rejected:
          return {
            fromTemplate: {
              subject: `You rejected trip ${event.id} on Rentality platform`,
              baseUrl: baseUrl,
              message: `You have successfully rejected trip ${event.id}. The guest has been notified about your decision.`,
              actionPath: "/host/trips/booked",
              actionText: "View Trips",
            },
            toTemplate: {
              subject: `Trip ${event.id} was rejected on Rentality platform`,
              baseUrl: baseUrl,
              message: `Unfortunately, trip ${event.id} has been rejected by the other party.`,
              actionPath: "/guest/trips/booked",
              actionText: "View Trips",
            },
          };
        default:
          return { fromTemplate: null, toTemplate: null };
      }
    default:
      return { fromTemplate: null, toTemplate: null };
  }
}

export function getEmailHtml(emailTemplate: EmailTemplate): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8" /><link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet"><title>Notification</title><style>body { font-family: "Montserrat", Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; } .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05); } .header { width: 100%; height: auto; } .header img { width: 100%; height: auto; display: block; } .content { padding: 24px; color: #333333; line-height: 1.6; } .cta-button { display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2a2a72; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: bold; } .footer { padding: 16px; text-align: center; font-size: 12px; color: #999999; background-color: #f9f9f9; }</style></head><body><div class="email-container"><div class="header"><img src="${emailTemplate.baseUrl}/images/email_banner.png" alt="Rentality" /></div><div class="content"><h2>${emailTemplate.subject}</h2><p>Hi there,</p><p>${emailTemplate.message}</p><p>You can now manage and view details in our web application.</p><a href="${emailTemplate.baseUrl}${emailTemplate.actionPath}" class="cta-button" target="_blank">${emailTemplate.actionText}</a></div><div class="footer">&copy; 2025 Rentality Inc. All rights reserved.<br /></div></div></body></html>`;

}
