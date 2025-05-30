import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { supabase, type Compensation, type OfferedCompensation as OfferedCompensationType } from '../lib/supabase';
import { ScratchCard } from './ScratchCard';

interface OfferedCompensationsProps {
  complaintId: number;
  onCompensationSelected?: () => void;
}

export function OfferedCompensations({ complaintId, onCompensationSelected }: OfferedCompensationsProps) {
  const { currentUser } = useUser();
  const [compensations, setCompensations] = useState<Compensation[]>([]);
  const [offeredCompensations, setOfferedCompensations] = useState<OfferedCompensationType[]>([]);
  const [selectedCompensations, setSelectedCompensations] = useState<Compensation[]>([]);
  const [isOffering, setIsOffering] = useState(false);

  useEffect(() => {
    fetchCompensationsAndOffered();
  }, [complaintId]);

  async function fetchCompensationsAndOffered() {
    const [compensationsResponse, offeredResponse] = await Promise.all([
      supabase.from('compensations').select('*'),
      supabase
        .from('offered_compensations')
        .select('*')
        .eq('complaint_id', complaintId),
    ]);

    if (compensationsResponse.error) {
      console.error('Error fetching compensations:', compensationsResponse.error);
      return;
    }

    if (offeredResponse.error) {
      console.error('Error fetching offered compensations:', offeredResponse.error);
      return;
    }

    setCompensations(compensationsResponse.data || []);
    setOfferedCompensations(offeredResponse.data || []);
  }

  async function handleOfferCompensations() {
    if (currentUser !== 'Vish') {
      alert('Only Vish can offer compensations!');
      return;
    }

    if (selectedCompensations.length > 5) {
      alert('You can only offer up to 5 compensations!');
      return;
    }

    const offeredData = selectedCompensations.map((comp, index) => ({
      complaint_id: complaintId,
      compensation_id: comp.id,
      scratched: false,
      selected: false,
      order: index + 1,
    }));

    const { error } = await supabase.from('offered_compensations').insert(offeredData);

    if (error) {
      console.error('Error offering compensations:', error);
      return;
    }

    setIsOffering(false);
    setSelectedCompensations([]);
    fetchCompensationsAndOffered();
  }

  async function handleScratch(offeredCompensation: OfferedCompensationType) {
    if (currentUser !== 'Sabaa') {
      alert('Only Sabaa can scratch compensations!');
      return;
    }

    const { error } = await supabase
      .from('offered_compensations')
      .update({ scratched: true })
      .eq('id', offeredCompensation.id);

    if (error) {
      console.error('Error scratching compensation:', error);
      return;
    }

    fetchCompensationsAndOffered();
  }

  async function handleSelect(offeredCompensation: OfferedCompensationType) {
    if (currentUser !== 'Sabaa') {
      alert('Only Sabaa can select compensations!');
      return;
    }

    const { error } = await supabase
      .from('offered_compensations')
      .update({ selected: true })
      .eq('id', offeredCompensation.id);

    if (error) {
      console.error('Error selecting compensation:', error);
      return;
    }

    fetchCompensationsAndOffered();
    onCompensationSelected?.();
  }

  const canOffer = currentUser === 'Vish' && offeredCompensations.length === 0;
  const hasSelectedCompensation = offeredCompensations.some((oc) => oc.selected);

  if (isOffering) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Select Compensations to Offer (Max 5)
          </h3>
          <div className="space-x-3">
            <button
              onClick={() => setIsOffering(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleOfferCompensations}
              disabled={selectedCompensations.length === 0}
              className="btn-primary"
            >
              Offer Selected ({selectedCompensations.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {compensations.map((compensation) => (
            <motion.div
              key={compensation.id}
              layout
              className={`card cursor-pointer ${
                selectedCompensations.includes(compensation)
                  ? 'ring-2 ring-primary-500'
                  : ''
              }`}
              onClick={() =>
                setSelectedCompensations((prev) =>
                  prev.includes(compensation)
                    ? prev.filter((c) => c.id !== compensation.id)
                    : prev.length < 5
                    ? [...prev, compensation]
                    : prev
                )
              }
            >
              <h4 className="font-medium">{compensation.title}</h4>
              <p className="text-sm text-gray-600">{compensation.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Offered Compensations</h3>
        {canOffer && (
          <button onClick={() => setIsOffering(true)} className="btn-primary">
            Offer Compensations
          </button>
        )}
      </div>

      {offeredCompensations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {offeredCompensations.map((offered) => {
            const compensation = compensations.find(
              (c) => c.id === offered.compensation_id
            );
            if (!compensation) return null;

            return (
              <ScratchCard
                key={offered.id}
                compensation={compensation}
                isScratched={offered.scratched}
                isSelected={offered.selected}
                onScratch={() => handleScratch(offered)}
                onSelect={() => handleSelect(offered)}
                disabled={
                  currentUser !== 'Sabaa' ||
                  hasSelectedCompensation ||
                  (offered.scratched && !offered.selected)
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No compensations offered yet.
        </div>
      )}
    </div>
  );
} 