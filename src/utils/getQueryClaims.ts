import { GetClaimInfosResponse, QueryClaimInfo } from "@/pages/api/getQueryClaims"

export async function getQueryClaims(isHost: boolean, walletAddress: string) {
    
    const params = new URLSearchParams({
      isHost: String(isHost),
      walletAddress: walletAddress.toLocaleLowerCase(),
    })

      const res = await fetch(`/api/query/queryClaims?${params.toString()}`)

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to fetch claims')
      }

      const data = await res.json()
      return data as QueryClaimInfo[]
}
