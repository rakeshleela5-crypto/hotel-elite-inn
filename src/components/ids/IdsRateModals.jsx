import React, { useState } from 'react';
import { HelpCircle, Check, X, FileText, Printer, CreditCard, DollarSign } from 'lucide-react';

/* 1. RATE INFORMATION MODAL (Frame 004) */
export function IdsRateInformationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  roomType = 'DELUXE',
  initialRate = 6749.10 
}) {
  const [rateType, setRateType] = useState('DISCOUNT');
  const [mealPlan, setMealPlan] = useState('CP');
  const [currency, setCurrency] = useState('INR');
  const [rackId, setRackId] = useState('1');
  const [discPercent, setDiscPercent] = useState('10.00');
  const [singleTariff, setSingleTariff] = useState(initialRate.toFixed(2));
  const [doubleTariff, setDoubleTariff] = useState(initialRate.toFixed(2));
  const [extraAdult, setExtraAdult] = useState('1000.00');
  const [taxStruct1, setTaxStruct1] = useState('798');
  const [taxStruct2, setTaxStruct2] = useState('804');
  const [printRate, setPrintRate] = useState('YES');

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay">
      <div className="ids-dialog-window" style={{ width: '480px' }}>
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Rate Information</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '6px', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Rate Type</span>
            <select className="ids-select" value={rateType} onChange={(e) => setRateType(e.target.value)}>
              <option value="DISCOUNT">DISCOUNT</option>
              <option value="RACK">RACK</option>
              <option value="COMPANY">COMPANY</option>
              <option value="PACKAGE">PACKAGE</option>
            </select>

            <span style={{ fontWeight: 600 }}>Meal Plan</span>
            <select className="ids-select" value={mealPlan} onChange={(e) => setMealPlan(e.target.value)}>
              <option value="CP">CP (Continental Plan / Bed & Breakfast)</option>
              <option value="EP">EP (European Plan / Room Only)</option>
              <option value="MAP">MAP (Modified American Plan / Half Board)</option>
              <option value="AP">AP (American Plan / Full Board)</option>
            </select>

            <span style={{ fontWeight: 600 }}>Currency</span>
            <select className="ids-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>

            <span style={{ fontWeight: 600 }}>Rate / Rack ID</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input className="ids-input" style={{ width: '60px' }} value={rackId} onChange={(e) => setRackId(e.target.value)} />
              <button className="ids-btn-classic" style={{ minWidth: '24px', padding: '2px 6px' }}>?</button>
              <input className="ids-input" style={{ width: '60px' }} defaultValue="1" readOnly />
            </div>

            <span style={{ fontWeight: 600 }}>Disc. %</span>
            <input 
              className="ids-input" 
              style={{ width: '80px', fontWeight: 700, color: '#0A246A' }} 
              value={discPercent} 
              onChange={(e) => setDiscPercent(e.target.value)} 
            />
          </div>

          {/* Tariff Table */}
          <table className="ids-grid-table" style={{ marginTop: '12px', border: '1px solid #716F64' }}>
            <thead>
              <tr>
                <th style={{ width: '130px' }}></th>
                <th style={{ textAlign: 'right' }}>Tariff</th>
                <th style={{ textAlign: 'right' }}>Plan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Single</td>
                <td style={{ textAlign: 'right' }}>
                  <input className="ids-input" style={{ width: '90px', textAlign: 'right' }} value={singleTariff} onChange={(e) => setSingleTariff(e.target.value)} />
                </td>
                <td><input className="ids-input" style={{ width: '80px' }} defaultValue="" /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Double</td>
                <td style={{ textAlign: 'right' }}>
                  <input className="ids-input" style={{ width: '90px', textAlign: 'right' }} value={doubleTariff} onChange={(e) => setDoubleTariff(e.target.value)} />
                </td>
                <td><input className="ids-input" style={{ width: '80px' }} defaultValue="" /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Triple</td>
                <td style={{ textAlign: 'right' }}><input className="ids-input" style={{ width: '90px', textAlign: 'right' }} defaultValue="" /></td>
                <td><input className="ids-input" style={{ width: '80px' }} defaultValue="" /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Quadruple</td>
                <td style={{ textAlign: 'right' }}><input className="ids-input" style={{ width: '90px', textAlign: 'right' }} defaultValue="" /></td>
                <td><input className="ids-input" style={{ width: '80px' }} defaultValue="" /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Extra Adult</td>
                <td style={{ textAlign: 'right' }}>
                  <input className="ids-input" style={{ width: '90px', textAlign: 'right' }} value={extraAdult} onChange={(e) => setExtraAdult(e.target.value)} />
                </td>
                <td><input className="ids-input" style={{ width: '80px' }} defaultValue="" /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Extra Child</td>
                <td style={{ textAlign: 'right' }}><input className="ids-input" style={{ width: '90px', textAlign: 'right' }} defaultValue="" /></td>
                <td><input className="ids-input" style={{ width: '80px' }} defaultValue="" /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Tax Struct.</td>
                <td><input className="ids-input" style={{ width: '90px' }} value={taxStruct1} onChange={(e) => setTaxStruct1(e.target.value)} /></td>
                <td><input className="ids-input" style={{ width: '80px' }} value={taxStruct2} onChange={(e) => setTaxStruct2(e.target.value)} /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Tax Struct.</td>
                <td><input className="ids-input" style={{ width: '90px' }} value={taxStruct2} readOnly /></td>
                <td><input className="ids-input" style={{ width: '80px' }} value={taxStruct2} readOnly /></td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600 }}>Print rate in Voucher / Pre-reg Card?</span>
            <select className="ids-select" value={printRate} onChange={(e) => setPrintRate(e.target.value)}>
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button className="ids-btn-classic" onClick={() => onConfirm({ rateType, mealPlan, discPercent, singleTariff, doubleTariff, extraAdult, taxStruct1, taxStruct2, printRate })}>
              Confirm
            </button>
            <button className="ids-btn-classic" onClick={() => setDiscPercent('0.00')}>
              Clear
            </button>
            <button className="ids-btn-classic" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. REASON ENTRY MODAL (Frame 005) */
export function IdsReasonEntryModal({ isOpen, onClose, onConfirm, reasonFor = 'DISCOUNT' }) {
  const [reason, setReason] = useState('Customer changed the dates');
  const [authorizedBy, setAuthorizedBy] = useState('DUTY MANAGER');

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay">
      <div className="ids-dialog-window" style={{ width: '420px' }}>
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Reason Entry</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '14px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: '10px', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Reason For</span>
            <input className="ids-input" value={reasonFor} readOnly style={{ background: '#EDEAE0' }} />

            <span style={{ fontWeight: 600 }}>Reason</span>
            <select className="ids-select" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="No Reason / Not applicable">No Reason / Not applicable</option>
              <option value="Cancelled by Customer">Cancelled by Customer</option>
              <option value="Cancelled by Hotel">Cancelled by Hotel</option>
              <option value="Customer Find better deal">Customer Find better deal</option>
              <option value="Customer was not satisfied">Customer was not satisfied</option>
              <option value="Customer does not arrived on given time">Customer does not arrived on given time</option>
              <option value="Customer changed the dates">Customer changed the dates</option>
              <option value="Customer cancelled this booking">Customer cancelled this booking</option>
            </select>

            <span style={{ fontWeight: 600 }}>Authorized By</span>
            <input className="ids-input" value={authorizedBy} onChange={(e) => setAuthorizedBy(e.target.value)} />
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button className="ids-btn-classic" onClick={() => onConfirm({ reason, authorizedBy })}>Confirm</button>
            <button className="ids-btn-classic" onClick={() => setReason('')}>Clear</button>
            <button className="ids-btn-classic" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 3. DUPLICATE GUEST NAME MODAL (Frame 006) */
export function IdsDuplicateGuestModal({ isOpen, onClose, guestName = 'Biswakarma Santosh' }) {
  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay">
      <div className="ids-dialog-window" style={{ width: '560px' }}>
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Duplicate Guest Name</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px' }}>
          <table className="ids-grid-table" style={{ width: '100%', border: '1px solid #716F64' }}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Res #</th>
                <th style={{ width: '60px' }}>Type</th>
                <th>Name</th>
                <th>Company/Segment</th>
                <th style={{ width: '110px' }}>Departure Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: '#0A246A', fontWeight: 700 }}>270</td>
                <td>DLX</td>
                <td style={{ color: '#0A246A' }}>{guestName}</td>
                <td>Fit</td>
                <td style={{ color: '#0A246A' }}>18-JAN-2022</td>
              </tr>
              <tr>
                <td>&nbsp;</td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td>&nbsp;</td><td></td><td></td><td></td><td></td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="ids-btn-classic" onClick={onClose}>Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 4. POST SAVE DIALOG (Frame 010) */
export function IdsPostSaveDialog({ isOpen, onClose, onOk, reservationNo = '271' }) {
  const [printVoucher, setPrintVoucher] = useState('YES');
  const [assignRooms, setAssignRooms] = useState('YES');
  const [deposits, setDeposits] = useState('YES');

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay">
      <div className="ids-dialog-window" style={{ width: '360px' }}>
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Post Save Dialog</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '14px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '8px', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Reservation #</span>
            <input className="ids-input" value={reservationNo} readOnly style={{ fontWeight: 700, width: '100px' }} />

            <span style={{ fontWeight: 600 }}>Print Voucher?</span>
            <select className="ids-select" value={printVoucher} onChange={(e) => setPrintVoucher(e.target.value)}>
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>

            <span style={{ fontWeight: 600 }}>Assign Rooms</span>
            <select className="ids-select" value={assignRooms} onChange={(e) => setAssignRooms(e.target.value)}>
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>

            <span style={{ fontWeight: 600 }}>Deposits</span>
            <select className="ids-select" value={deposits} onChange={(e) => setDeposits(e.target.value)}>
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
            <button className="ids-btn-classic" style={{ minWidth: '80px' }} onClick={() => onOk({ printVoucher, assignRooms, deposits })}>
              Ok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 5. POST RECEIPTS FOR ROOM RSVN (Frame 012) */
export function IdsPostReceiptsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  reservationNo = '271', 
  guestName = 'Mr Biswakarma Santosh',
  roomNo = '' 
}) {
  const [payMode, setPayMode] = useState('Credit Card'); // Cash, Credit Card, Cheque
  const [cardType, setCardType] = useState('GPAY');
  const [companyCode, setCompanyCode] = useState('CRDSBI1');
  const [cardRefNo, setCardRefNo] = useState('190248884933');
  const [particulars, setParticulars] = useState('Advance Booking');
  const [amount, setAmount] = useState('5000.00');
  const [authNo, setAuthNo] = useState('Nu1090499550mle');
  const [receiptNo, setReceiptNo] = useState('167');
  const [accountingDate, setAccountingDate] = useState('14-JAN-2022');
  const [userName, setUserName] = useState('MANAGER');

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay">
      <div className="ids-dialog-window" style={{ width: '680px' }}>
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Post Receipts FOR ROOM RSVN.</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px 14px' }}>
          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '90px 140px 80px 1fr', rowGap: '6px', columnGap: '8px', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Room#</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input className="ids-input" style={{ width: '80px' }} value={roomNo} readOnly />
              <button className="ids-btn-classic" style={{ minWidth: '22px', padding: '0 4px' }}>?</button>
            </div>

            <span style={{ fontWeight: 600 }}>Folio #</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input className="ids-input" style={{ width: '100px' }} defaultValue="" />
              <button className="ids-btn-classic" style={{ fontSize: '10px', padding: '1px 6px' }}>More..</button>
            </div>

            <span style={{ fontWeight: 600 }}>Reservation #</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input className="ids-input" style={{ width: '80px', fontWeight: 700 }} value={reservationNo} readOnly />
              <button className="ids-btn-classic" style={{ minWidth: '22px', padding: '0 4px' }}>?</button>
            </div>

            <span style={{ fontWeight: 600 }}>Guest Name</span>
            <input className="ids-input" value={guestName} readOnly style={{ background: '#EDEAE0' }} />

            <span style={{ fontWeight: 600 }}>Company Code</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input className="ids-input" style={{ width: '80px' }} defaultValue="" />
              <button className="ids-btn-classic" style={{ minWidth: '22px', padding: '0 4px' }}>?</button>
            </div>

            <span style={{ fontWeight: 600 }}>Company Name</span>
            <input className="ids-input" defaultValue="" />
          </div>

          {/* Payment Method Selector Strip */}
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px', background: '#DFDBC9', padding: '6px', border: '1px solid #B0AB9A' }}>
            <button 
              className="ids-btn-classic" 
              style={{ flex: 1, padding: '4px 8px', background: payMode === 'Cash' ? '#D5D1BD' : '#ECE9D8' }}
              onClick={() => setPayMode('Cash')}
            >
              💵 Cash
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ flex: 1, padding: '4px 8px', background: payMode === 'Credit Card' ? '#D5D1BD' : '#ECE9D8', fontWeight: 800 }}
              onClick={() => setPayMode('Credit Card')}
            >
              💳 Credit Card / UPI
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ flex: 1, padding: '4px 8px', background: payMode === 'Cheque' ? '#D5D1BD' : '#ECE9D8' }}
              onClick={() => setPayMode('Cheque')}
            >
              📝 Cheque
            </button>
          </div>

          {/* Currency row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span>Currency Code</span>
            <input className="ids-input" style={{ width: '50px' }} defaultValue="INR" readOnly />
            <button className="ids-btn-classic" style={{ minWidth: '22px', padding: '0 4px' }}>?</button>
            <span style={{ marginLeft: '12px' }}>Exchange Rate</span>
            <input className="ids-input" style={{ width: '70px' }} defaultValue="1.000000" readOnly />
            <span style={{ marginLeft: '12px' }}>Exg. Amt.</span>
            <input className="ids-input" style={{ width: '70px' }} defaultValue="" />
          </div>

          {/* Credit Card / Digital UPI Details Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '12px', marginTop: '10px' }}>
            <div style={{ border: '1px solid #B0AB9A', padding: '10px', background: '#F5F3EB' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px', color: '#0A246A' }}>Credit Card Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: '6px', alignItems: 'center' }}>
                <span>Credit Card Type</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input className="ids-input" style={{ width: '90px' }} value={cardType} onChange={(e) => setCardType(e.target.value)} />
                  <button className="ids-btn-classic" style={{ minWidth: '22px', padding: '0 4px' }}>?</button>
                </div>

                <span>Company Code</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input className="ids-input" style={{ width: '90px' }} value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} />
                  <button className="ids-btn-classic" style={{ minWidth: '22px', padding: '0 4px' }}>?</button>
                </div>

                <span>Credit Card # / Ref</span>
                <input className="ids-input" value={cardRefNo} onChange={(e) => setCardRefNo(e.target.value)} />

                <span>Particulars</span>
                <input className="ids-input" value={particulars} onChange={(e) => setParticulars(e.target.value)} />

                <span>Amount</span>
                <input className="ids-input" style={{ fontWeight: 700, color: '#BD5317', fontSize: '12px' }} value={amount} onChange={(e) => setAmount(e.target.value)} />

                <span>Authorization #</span>
                <input className="ids-input" value={authNo} onChange={(e) => setAuthNo(e.target.value)} />

                <span>Receipt #</span>
                <input className="ids-input" value={receiptNo} readOnly style={{ width: '100px', fontWeight: 700 }} />
              </div>
            </div>

            {/* Right Audit Info */}
            <div style={{ border: '1px solid #B0AB9A', padding: '10px', background: '#EDEAE0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#666' }}>Accounting Date</span>
                <input className="ids-input" style={{ width: '100%' }} value={accountingDate} readOnly />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#666' }}>User</span>
                <input className="ids-input" style={{ width: '100%' }} value={userName} readOnly />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#666' }}>Last Updated</span>
                <input className="ids-input" style={{ width: '100%' }} defaultValue="14-JAN-2022 19:57" readOnly />
              </div>
            </div>
          </div>

          {/* Action Button Row */}
          <div style={{ marginTop: '14px', display: 'flex', gap: '4px', justifyContent: 'center', background: '#DFDBC9', padding: '6px', borderTop: '1px solid #B0AB9A' }}>
            <button className="ids-btn-classic">Add</button>
            <button className="ids-btn-classic">Modify</button>
            <button className="ids-btn-classic">Delete</button>
            <button className="ids-btn-classic">Browse</button>
            <button className="ids-btn-classic">Previous</button>
            <button className="ids-btn-classic">Next</button>
            <button className="ids-btn-classic" style={{ fontWeight: 800, color: '#0A246A' }} onClick={() => onSave({ payMode, amount, receiptNo, cardRefNo })}>
              Save
            </button>
            <button className="ids-btn-classic">Panel</button>
            <button className="ids-btn-classic" onClick={onClose}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
