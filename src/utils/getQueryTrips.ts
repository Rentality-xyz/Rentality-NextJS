import { TripEntity } from "@/pages/api/queryTrips"

export async function getQueryTrips(isHost: boolean, walletAddress: string) {
    
    const params = new URLSearchParams({
      isHost: String(isHost),
      walletAddress: walletAddress.toLocaleLowerCase(),
    })

      const res = await fetch(`/api/query/queryTrips?${params.toString()}`)

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to fetch trips')
      }

      const data = await res.json()
      return data.tripEntities as TripEntity[]
}
