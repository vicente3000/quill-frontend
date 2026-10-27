import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useCreateOrderMutation } from '../../../shared/api/hooks';
import { getApiErrorMessage } from '../../../shared/api/get-api-error-message';
import { logError } from '../../../shared/api/error-logging';
import { isStubMode } from '../../../shared/api/stub-mode';
import { CreateOrderInputSchema } from '../../../shared/api/validators';
import type { StockQuote } from '../../../shared/api/validators';
import { AnimatedCurrency } from '../../../shared/components/AnimatedCurrency';
import { button } from '../../../shared/design-system/surfaces';
import { hint as hintClass } from '../../../shared/design-system/typography';
import { formGrid, buyModeToggle, buyModeButton } from '../../../shared/design-system/layout';
import { inputBase, successMessage, errorMessage } from '../../../shared/design-system/forms';
import { resolveCurrency } from '../../../shared/utils/currency';
import { calculateQuantityFromClpAmount } from '../utils/order-calculations';

type FormValues = {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  quantity: number;
  limitPrice?: number;
};

interface OrderFormProps {
  quotes: StockQuote[];
  rate: number;
  selectedSymbol: string;
  marketOpen?: boolean;
  onSymbolChange?: (symbol: string) => void;
  compact?: boolean;
  availableBalance?: number;
  tournamentId?: string;
  commissionRate?: number;
}

export function OrderForm({ quotes, rate, selectedSymbol, marketOpen, onSymbolChange, compact = false, availableBalance, tournamentId, commissionRate = 0.005 }: OrderFormProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [buyMode, setBuyMode] = useState<'shares' | 'amount'>('shares');
  const [investAmount, setInvestAmount] = useState<string>('');
  const limitPriceUserTouched = useRef(false);
  const orderMutation = useCreateOrderMutation(tournamentId);
  const demoMode = isStubMode();
  const currentQuote = useMemo(
    () => quotes.find((quote) => quote.symbol === selectedSymbol),
    [quotes, selectedSymbol],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(CreateOrderInputSchema),
    defaultValues: {
      symbol: selectedSymbol,
      side: 'BUY',
      type: 'LIMIT',
      quantity: 1,
      limitPrice: currentQuote?.close,
    },
  });

  useEffect(() => {
    form.setValue('symbol', selectedSymbol);
    limitPriceUserTouched.current = false;
  }, [form, selectedSymbol]);

  useEffect(() => {
    if (!limitPriceUserTouched.current && currentQuote) {
      form.setValue('limitPrice', currentQuote.close);
    }
  }, [currentQuote, form]);

  const { onChange: formSymbolOnChange, ...symbolRest } = form.register('symbol');
  const { onChange: limitPriceOnChange, ...limitPriceRest } = form.register('limitPrice', { valueAsNumber: true });
  const priceCurrency = currentQuote ? resolveCurrency(currentQuote.currency) : 'CLP';
  const secondaryCurrency = priceCurrency === 'CLP' ? 'USD' : 'CLP';
  const selectedSide = useWatch({
    control: form.control,
    name: 'side',
  });
  const orderType = useWatch({
    control: form.control,
    name: 'type',
  });
  const watchedLimitPrice = useWatch({
    control: form.control,
    name: 'limitPrice',
  });
  const watchedQuantity = useWatch({
    control: form.control,
    name: 'quantity',
  });

  const handleSubmit = async (values: FormValues) => {
    setFeedbackMessage(null);

    if (demoMode) {
      setFeedbackMessage('La creacion de ordenes esta deshabilitada en modo demo.');
      return;
    }

    if (!marketOpen && values.type === 'MARKET') {
      setFeedbackMessage('El mercado está cerrado. Las órdenes MARKET solo pueden ejecutarse dentro del horario de operación.');
      return;
    }

    try {
      const submitValues = {
        ...values,
        limitPrice: values.type === 'MARKET' ? undefined : values.limitPrice,
      };

      if (buyMode === 'amount') {
        const price =
          orderType === 'MARKET'
            ? (currentQuote?.close ?? 0)
            : (values.limitPrice ?? 0);

        if (price <= 0) {
          setFeedbackMessage('Precio invalido. Verifica los datos.');
          return;
        }

        const calculatedQty = calculateQuantityFromClpAmount({
          amountClp: Number(investAmount),
          price,
          priceCurrency,
          usdclpRate: rate,
        });
        if (calculatedQty < 1) {
          setFeedbackMessage(
            `El monto ingresado no es suficiente para ${selectedSide === 'BUY' ? 'comprar' : 'vender'} al menos 1 accion.`,
          );
          return;
        }

        submitValues.quantity = calculatedQty;
      }

      await orderMutation.mutateAsync(CreateOrderInputSchema.parse(submitValues));
      setFeedbackMessage(
        values.type === 'MARKET'
          ? 'Orden ejecutada al precio de mercado.'
          : 'Orden registrada. Quedara pendiente hasta que el mercado cumpla la condicion.',
      );
      form.reset({
        symbol: selectedSymbol,
        side: 'BUY',
        type: 'LIMIT',
        quantity: 1,
        limitPrice:
          quotes.find((quote) => quote.symbol === selectedSymbol)?.close ?? undefined,
      });
      setInvestAmount('');
    } catch (error) {
      logError('[OrderForm] No fue posible crear la orden', error);
      const apiMsg = getApiErrorMessage(error, '');
      if (apiMsg.toLowerCase().includes('cerrado')) {
        setFeedbackMessage('El mercado está cerrado en este momento. Las órdenes MARKET solo pueden ejecutarse dentro del horario de operación.');
      } else {
        setFeedbackMessage(apiMsg || 'No fue posible crear la orden. Revisa los datos e intenta nuevamente.');
      }
    }
  };

  const handleModeToggle = (mode: 'shares' | 'amount') => {
    setBuyMode(mode);
    if (mode === 'amount') {
      setInvestAmount('');
    }
  };

  const investAmountValue = investAmount === '' ? 0 : Number(investAmount);

  const sharesCostPreview = (() => {
    if (buyMode !== 'shares' || !watchedQuantity || watchedQuantity < 1) return null;

    const price =
      orderType === 'MARKET'
        ? (currentQuote?.close ?? 0)
        : (watchedLimitPrice ?? 0);

    if (price <= 0) return null;

    const totalCost = watchedQuantity * price;
    return (
      <p className={hintClass}>
        {selectedSide === 'BUY' ? 'Costo total estimado' : 'Ingreso total estimado'}: <AnimatedCurrency value={totalCost} sourceCurrency={priceCurrency} rate={rate} /> (<AnimatedCurrency value={totalCost} currency={secondaryCurrency} sourceCurrency={priceCurrency} rate={rate} />)
        <br />
        <small>
          ({watchedQuantity} acciones &times; <AnimatedCurrency value={price} currency={priceCurrency} sourceCurrency={priceCurrency} rate={rate} /> c/u)
        </small>
      </p>
    );
  })();

  const calculatedPreview = (() => {
    if (buyMode !== 'amount' || investAmountValue <= 0) return null;

    const price =
      orderType === 'MARKET'
        ? (currentQuote?.close ?? 0)
        : (watchedLimitPrice ?? 0);

    if (price <= 0) return null;

    const calculatedQty = calculateQuantityFromClpAmount({
      amountClp: investAmountValue,
      price,
      priceCurrency,
      usdclpRate: rate,
    });

    if (calculatedQty < 1) {
      return (
        <p className={hintClass} style={{ color: 'var(--main-page-danger)' }}>
          Monto insuficiente. Debe ser al menos{' '}
          <AnimatedCurrency value={price} sourceCurrency={priceCurrency} rate={rate} /> para {selectedSide === 'BUY' ? 'comprar' : 'vender'} 1 accion.
        </p>
      );
    }

    const totalCost = calculatedQty * price;
    return (
      <p className={hintClass}>
        &asymp; {calculatedQty} acciones &middot; {selectedSide === 'BUY' ? 'Costo estimado' : 'Ingreso estimado'}:{' '}
        <AnimatedCurrency value={totalCost} sourceCurrency={priceCurrency} rate={rate} /> (<AnimatedCurrency value={totalCost} currency={secondaryCurrency} sourceCurrency={priceCurrency} rate={rate} />)
        <br />
        <small>
          (<AnimatedCurrency value={totalCost} sourceCurrency={priceCurrency} rate={rate} /> / {calculatedQty}{' '}
          acciones &times; <AnimatedCurrency value={price} currency={priceCurrency} sourceCurrency={priceCurrency} rate={rate} /> c/u)
        </small>
      </p>
    );
  })();

  if (compact) {
    const previewPrice = orderType === 'MARKET' ? (currentQuote?.close ?? 0) : (watchedLimitPrice ?? currentQuote?.close ?? 0);
    const previewGross = buyMode === 'shares' ? Math.max(0, watchedQuantity ?? 0) * previewPrice : Math.max(0, investAmountValue);
    const previewGrossClp = buyMode === 'amount' || priceCurrency === 'CLP' ? previewGross : previewGross * rate;
    const previewCommissionClp = previewGrossClp * commissionRate;
    const previewNetClp = selectedSide === 'BUY' ? previewGrossClp + previewCommissionClp : previewGrossClp - previewCommissionClp;
    const projectedBalance = availableBalance === undefined ? undefined : selectedSide === 'BUY' ? availableBalance - previewNetClp : availableBalance + previewNetClp;

    return (
      <form className="terminal-order-form" onSubmit={(event) => { void form.handleSubmit(handleSubmit)(event); }}>
        <div className="terminal-side-switch" aria-label="Tipo de operación">
          <button type="button" aria-pressed={selectedSide === 'BUY'} onClick={() => form.setValue('side', 'BUY')} disabled={demoMode}>Comprar</button>
          <button type="button" aria-pressed={selectedSide === 'SELL'} onClick={() => form.setValue('side', 'SELL')} disabled={demoMode}>Vender</button>
        </div>
        <div className="terminal-order-types" aria-label="Modalidad de orden">
          <button type="button" aria-pressed={orderType === 'LIMIT'} onClick={() => form.setValue('type', 'LIMIT')}>Límite</button>
          <button type="button" aria-pressed={orderType === 'MARKET'} disabled={marketOpen !== true} onClick={() => form.setValue('type', 'MARKET')}>Mercado</button>
        </div>
        <div className="terminal-order-kind">Orden {orderType === 'LIMIT' ? 'limitada' : 'de mercado'} · {currentQuote?.symbol}</div>
        {orderType === 'LIMIT' ? <label>Precio límite · {priceCurrency}
          <input type="number" step="0.01" disabled={demoMode} onChange={(event) => { limitPriceUserTouched.current = true; void limitPriceOnChange(event); }} {...limitPriceRest} />
        </label> : <div className="terminal-market-price-preview"><span>Precio referencial</span><strong><AnimatedCurrency value={previewPrice} currency={priceCurrency} sourceCurrency={priceCurrency} rate={rate} /></strong></div>}
        <div className="terminal-mode-switch">
          <button type="button" aria-pressed={buyMode === 'shares'} onClick={() => handleModeToggle('shares')} disabled={demoMode}>Cantidad</button>
          <button type="button" aria-pressed={buyMode === 'amount'} onClick={() => handleModeToggle('amount')} disabled={demoMode}>Monto CLP</button>
        </div>
        {buyMode === 'shares' ? (
          <label>Cantidad de acciones
            <input type="number" min="1" disabled={demoMode} {...form.register('quantity', { valueAsNumber: true })} />
          </label>
        ) : (
          <label>{selectedSide === 'BUY' ? 'Monto a invertir' : 'Monto a recibir'} · CLP
            <input type="number" min="0" disabled={demoMode} value={investAmount} onChange={(event) => setInvestAmount(event.target.value)} />
          </label>
        )}
        <div className="terminal-balance"><span>Disponible</span><span>{availableBalance === undefined ? '—' : <AnimatedCurrency value={availableBalance} rate={rate} />}</span></div>
        <div className="terminal-order-summary">
          <div><span>Subtotal</span><strong><AnimatedCurrency value={previewGrossClp} sourceCurrency="CLP" rate={rate} /></strong></div>
          <div><span>Comisión estimada · {(commissionRate * 100).toLocaleString('es-CL', { maximumFractionDigits: 4 })}%</span><strong><AnimatedCurrency value={previewCommissionClp} sourceCurrency="CLP" rate={rate} /></strong></div>
          <div className="terminal-total"><span>{selectedSide === 'BUY' ? 'Total a pagar' : 'Total a recibir'}</span><strong><AnimatedCurrency value={previewNetClp} sourceCurrency="CLP" rate={rate} /></strong></div>
          {projectedBalance !== undefined ? <div><span>Saldo posterior</span><strong className={projectedBalance < 0 ? 'text-[#EF4557]' : ''}><AnimatedCurrency value={projectedBalance} sourceCurrency="CLP" rate={rate} /></strong></div> : null}
        </div>
        {marketOpen === false ? <p className="terminal-hint">Mercado cerrado: la orden quedará pendiente.</p> : null}
        {feedbackMessage ? <p className={feedbackMessage.includes('cerrado') ? errorMessage : successMessage}>{feedbackMessage}</p> : null}
        <button className="terminal-submit" disabled={orderMutation.isPending || demoMode} type="submit">{demoMode ? 'Revisar orden' : orderMutation.isPending ? 'Creando…' : selectedSide === 'BUY' ? 'Revisar compra' : 'Revisar venta'}</button>
        <p className="terminal-hint">{orderType === 'LIMIT' ? 'Se ejecutará al alcanzar el precio límite.' : 'Se ejecutará de inmediato al precio disponible.'}</p>
      </form>
    );
  }

  return (
    <form
      className={formGrid}
      onSubmit={(event) => {
        void form.handleSubmit(handleSubmit)(event);
      }}
    >
      {demoMode ? (
        <p className={hintClass}>
          Estás en modo demo. Puedes revisar el formulario, pero crear órdenes está deshabilitado.
        </p>
      ) : null}

      {marketOpen === undefined ? (
        <p className={hintClass} style={{ color: 'var(--main-page-danger)' }}>
          No fue posible confirmar el estado del mercado. Las órdenes MARKET no están disponibles.
        </p>
      ) : !marketOpen ? (
        <p className={hintClass} style={{ color: 'var(--main-page-danger)' }}>
          El mercado está cerrado. Solo puedes registrar órdenes limitadas; las órdenes MARKET se rechazarán.
        </p>
      ) : null}

      <div>
        <strong className="block">Precio actual</strong>
        <span className={`${hintClass} block`}>
          {currentQuote
            ? <>{currentQuote.symbol} · <AnimatedCurrency value={currentQuote.close} currency={priceCurrency} sourceCurrency={priceCurrency} rate={rate} /> (<AnimatedCurrency value={currentQuote.close} currency={secondaryCurrency} sourceCurrency={priceCurrency} rate={rate} />)</>
            : 'Selecciona una accion para continuar.'}
        </span>
      </div>

      <label>
        Accion
        <select
          className={inputBase}
          disabled={demoMode}
          onChange={(e) => {
            void formSymbolOnChange(e);
            onSymbolChange?.(e.target.value);
          }}
          {...symbolRest}
        >
          {quotes.map((quote) => (
            <option key={quote.symbol} value={quote.symbol}>
              {quote.symbol} · {quote.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Tipo
        <select className={inputBase} disabled={demoMode} {...form.register('side')}>
          <option value="BUY">Compra</option>
          <option value="SELL">Venta</option>
        </select>
      </label>

      <label>
        Modalidad
        <select className={inputBase} disabled={demoMode} {...form.register('type')}>
          <option value="LIMIT">Limite</option>
          <option value="MARKET" disabled={marketOpen !== true}>Mercado{marketOpen !== true ? ' (no disponible)' : ''}</option>
        </select>
      </label>

      <div className={`${buyModeToggle} max-[720px]:flex-col`}>
        <button
          type="button"
          className={`${button.base} ${buyModeButton} ${buyMode === 'shares' ? button.primary : button.secondary}`}
          disabled={demoMode}
          onClick={() => handleModeToggle('shares')}
        >
          Por cantidad
        </button>
        <button
          type="button"
          className={`${button.base} ${buyModeButton} ${buyMode === 'amount' ? button.primary : button.secondary}`}
          disabled={demoMode}
          onClick={() => handleModeToggle('amount')}
        >
          Por monto
        </button>
      </div>

      {buyMode === 'shares' ? (
        <label>
          Cantidad
          <input
            className={inputBase}
            disabled={demoMode}
            key="quantity"
            type="number"
            {...form.register('quantity', { valueAsNumber: true })}
          />
        </label>
      ) : (
        <label>
          {selectedSide === 'BUY' ? 'Monto a invertir (CLP)' : 'Monto a recibir (CLP)'}
          <input
            className={inputBase}
            disabled={demoMode}
            key="amount"
            type="number"
            value={investAmount}
            onChange={(e) => setInvestAmount(e.target.value)}
          />
        </label>
      )}

      {sharesCostPreview}

      {orderType === 'LIMIT' ? (
        <label>
          Precio limite ({priceCurrency})
          <input
            className={inputBase}
            disabled={demoMode}
            step="0.01"
            type="number"
            onChange={(e) => {
              limitPriceUserTouched.current = true;
              void limitPriceOnChange(e);
            }}
            {...limitPriceRest}
          />
          {watchedLimitPrice && watchedLimitPrice > 0 ? (
            <small className={hintClass}>
              ≈ <AnimatedCurrency value={watchedLimitPrice} currency={secondaryCurrency} sourceCurrency={priceCurrency} rate={rate} />
            </small>
          ) : null}
        </label>
      ) : null}

      {calculatedPreview}

      <p className={hintClass}>
        {orderType === 'MARKET'
          ? 'La orden se ejecutara de inmediato al precio actual del mercado.'
          : selectedSide === 'BUY'
            ? 'La compra se ejecuta cuando el mercado cae al precio limite o por debajo.'
            : 'La venta se ejecuta cuando el mercado sube al precio limite o por encima.'}
      </p>

      {feedbackMessage ? (
        <p className={feedbackMessage.includes('cerrado') ? errorMessage : successMessage}>{feedbackMessage}</p>
      ) : null}
      {orderMutation.isError && !feedbackMessage?.includes('cerrado') ? (
        <p className={errorMessage}>
          {getApiErrorMessage(
            orderMutation.error,
            'No fue posible registrar la orden.',
          )}
        </p>
      ) : null}

      <button
        className={`${button.base} ${button.primary}`}
        disabled={orderMutation.isPending || demoMode}
        type="submit"
      >
        {demoMode
          ? 'Modo demo'
          : orderMutation.isPending
            ? 'Creando orden...'
            : marketOpen !== true && orderType === 'MARKET'
              ? marketOpen === undefined ? 'Estado no disponible' : 'Mercado cerrado'
              : 'Crear orden'}
      </button>
    </form>
  );
}
