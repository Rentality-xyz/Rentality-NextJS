import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { CarInfo, DeliveryPricesEntity, LocationInfo, PaymentInfoEntity, TaxesEntity, TaxValueEntity, TripEntity } from "../../generated/schema"
import { getRentalityGateway, notImplemented } from "./helpers"
import {RentalityEvent} from "../../generated/RentalityNotificationService/RentalityGateway";

export function handleTaxesEvent(event: RentalityEvent): void {
  switch (event.params.objectStatus) {

    default: handleTaxes(event);
    break;

}
}

function handleTaxes(event: RentalityEvent): void {

  let contract = getRentalityGateway();
  let taxesInfo = contract.try_getTaxesInfoById(event.params.id)

  if (taxesInfo.reverted) {
    log.warning("getTaxes reverted for id: {}", [event.params.id.toString()]);
    return;
  } 
  const taxesId = taxesInfo.value.location.toString() + taxesInfo.value.locationType.toString();
  let taxesEntity = TaxesEntity.load(taxesId);
  if( taxesEntity == null) {
    taxesEntity = new TaxesEntity(taxesId);
  }
    taxesEntity.location = taxesInfo.value.location;
    taxesEntity.locationType = taxesInfo.value.locationType;

    const taxValues: string[] = [];

    for (let i = 0; i < taxesInfo.value.taxes.length; i++) {
        const taxValueId = `${i}-${taxesInfo.value.location}`;
        
        const taxValue = new TaxValueEntity(taxValueId);
        
        taxValue.name = taxesInfo.value.taxes[i].name;
        taxValue.value = taxesInfo.value.taxes[i].value;
        taxValue.tType = taxesInfo.value.taxes[i].tType.toString();
        
        taxValue.save();
        
        taxValues.push(taxValueId);
    }
    
    taxesEntity.taxesData = taxValues;
    taxesEntity.save();
}

