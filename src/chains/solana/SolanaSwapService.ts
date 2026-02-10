import axios from 'axios';
import { ENV } from '@/config/env';
import { SwapQuoteParams, SwapQuote, RoutePlanStep } from '@/types/chain';
import { JupiterQuoteResponse, JupiterSwapResponse } from '@/types/swap';
import { DEFAULT_SLIPPAGE_BPS } from '@/config/constants';

export class SolanaSwapService {
  private baseUrl = ENV.JUPITER_API_BASE;

  async getQuote(params: SwapQuoteParams): Promise<SwapQuote> {
    const { data } = await axios.get<JupiterQuoteResponse>(
      `${this.baseUrl}/v6/quote`,
      {
        params: {
          inputMint: params.inputMint,
          outputMint: params.outputMint,
          amount: params.amount.toString(),
          slippageBps: params.slippageBps ?? DEFAULT_SLIPPAGE_BPS,
        },
      }
    );

    const routePlan: RoutePlanStep[] = data.routePlan.map((r) => ({
      ammKey: r.swapInfo.ammKey,
      label: r.swapInfo.label,
      inputMint: r.swapInfo.inputMint,
      outputMint: r.swapInfo.outputMint,
      percent: r.percent,
    }));

    return {
      inputMint: data.inputMint,
      outputMint: data.outputMint,
      inAmount: data.inAmount,
      outAmount: data.outAmount,
      priceImpactPct: parseFloat(data.priceImpactPct),
      routePlan,
      raw: data,
    };
  }

  async getSwapTransaction(
    quoteResponse: JupiterQuoteResponse,
    userPublicKey: string
  ): Promise<JupiterSwapResponse> {
    const { data } = await axios.post<JupiterSwapResponse>(
      `${this.baseUrl}/v6/swap`,
      {
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }
    );
    return data;
  }
}
