import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import RntButton from './rntButton';
import { TripInfo } from '@/model/TripInfo';

export default function RntContractModal( {tripId, tripInfo} : {tripId : bigint, tripInfo: TripInfo}) {
	const [open, setOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<React.Fragment>
			<RntButton className="w-60 h-10" onClick={handleClickOpen}>
				View Contract
			</RntButton>
			<Dialog
				fullScreen
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				PaperProps={{
					sx: {
						borderRadius: "20px",
					},
				}}
			>
				<DialogContent sx={{
					background: "#240F50",
				}}>
					<DialogContentText sx={{
						color: "#fff",
					}} id="alert-dialog-description">
						<div className="flex flex-col m-4">
							<div class="flex flex-col m-4">
								<h1 class="text-4xl mb-4">Car sharing agreement #{tripId.toString()}</h1>
								<h3 class="text-2xl mb-1">James Webb’s trip with Edwin Hubble’s Tesla Model 3 2022</h3>
								<p>Refer to this document for evidence of your Rentality trip transaction when interacting with law enforcement,
									insurance providers, roadside service providers, impound lot attendants, or others.</p>
								<h4 class="text-xl mb-1">Key agreement facts</h4>
								<ol class='list-decimal list-inside [counter-reset:section]'>
									<li class="[counter-increment:section] marker:[content:counters(section,'. ')]">
										During the car sharing period (see in Trip Summary “Trip Start” and “Trip End”), the person “Guest” named below was
										given permission to drive the vehicle listed below by the “Host” (either the car owner or an authorized representative)
										in accordance with Rentality's terms of service, to which both the Guest and the Host have agreed. The terms are detailed in the following documents:
										<ol class=' ms-3 list-decimal list-inside [counter-reset:section]'>
											<li class="[counter-increment:section] marker:[content:counters(section,'.')]">
												&nbsp;<a href='https://rentality.xyz/policies/terms'>Terms of service</a>
											</li>
											<li class="[counter-increment:section] marker:[content:counters(section,'.')]">
												&nbsp;<a href='https://rentality.xyz/policies/cancellation'>Cancellation policy</a>
											</li>
											<li class="[counter-increment:section] marker:[content:counters(section,'.')]">
												&nbsp;<a href='https://rentality.xyz/policies/prohibiteduses'>Prohibited Uses</a>
											</li>
											<li class="[counter-increment:section] marker:[content:counters(section,'.')]">
												&nbsp;<a href='https://rentality.xyz/policies/privacy'>Privacy policy</a>
											</li>
										</ol>
									</li>
									<li class="[counter-increment:section] marker:[content:counters(section,'. ')]">
										The Terms of service, together with the Cancellation Policy, Prohibited Uses and Privacy Policy constitute this Car sharing agreement
										between the person identified as “Guest” and the person identified as “Host”.
									</li>
									<li class="[counter-increment:section] marker:[content:counters(section,'. ')]">
										Rentality is a digital peer-to-peer car sharing platform, connecting private car owners who want to rent out their vehicles with individuals
										seeking to use them for a fee.
									</li>
									<li class="[counter-increment:section] marker:[content:counters(section,'. ')]">
										By listing their car on the Rentality platform, the Host confirms that their vehicle is safe, well-maintained, legally registered, and covered
										by their personal insurance.
									</li>
								</ol>
							</div>


							<div class="flex flex-col m-4">
								The person identified as “Guest” and the person identified as “Host” on the Basic Agreement Information above were connected online through a website or mobile application provided by Rentality (collectively, the “Rentality Services”).
								As part of connecting through the Rentality Services, the Host and Guest agreed to be bound by the Terms of service, Cancellation policy, Prohibited Uses and Privacy Policy published at https:// Rentality.xyz/policies/terms.
								The guest who booked the trip on the Rentality platform is recognized as the "Primary Driver" and is liable under these Terms and Conditions, whether or not he or she was personally driving the vehicle.
							</div>

						</div>
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{
					background: "#240F50",
					justifyContent: "center",
				}}>
					<RntButton onClick={handleClose}>Disagree</RntButton>
					<RntButton onClick={handleClose} autoFocus>
						Agree
					</RntButton>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}
