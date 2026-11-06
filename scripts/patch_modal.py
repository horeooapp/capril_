with open('src/components/dashboard/mandates/CreateMandateModal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update interface
code = code.replace(
'''interface CreateMandateModalProps {
    isOpen: boolean;
    onClose: () => void;
    properties: any[];
    onMandateCreated?: () => void;
}''',
'''interface CreateMandateModalProps {
    isOpen: boolean;
    onClose: () => void;
    properties: any[];
    agencies?: any[];
    onMandateCreated?: () => void;
}'''
)

# 2. Update component signature
code = code.replace(
'''export default function CreateMandateModal({
    isOpen,
    onClose,
    properties = [],
    onMandateCreated
}: CreateMandateModalProps) {''',
'''export default function CreateMandateModal({
    isOpen,
    onClose,
    properties = [],
    agencies = [],
    onMandateCreated
}: CreateMandateModalProps) {'''
)

# 3. Add selectedAgentId state
code = code.replace(
'''    // Form State
    const [selectedPropertyId, setSelectedPropertyId] = useState("")''',
'''    // Form State
    const [selectedPropertyId, setSelectedPropertyId] = useState("")
    const [selectedAgentId, setSelectedAgentId] = useState("")'''
)

# 4. Pass agentId to createMandate
code = code.replace(
'''            const res = await createMandate({
                propertyId: selectedPropertyId,
                mandateType,''',
'''            const res = await createMandate({
                propertyId: selectedPropertyId,
                agentId: selectedAgentId || undefined,
                mandateType,'''
)

# 5. Add Agency picker in Step 1
agency_picker = '''                            {/* Choix de l'agence mandataire */}
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-2">
                                    Agence Immobilière Mandataire <span className="text-rose-500">*</span>
                                </label>
                                <select 
                                    value={selectedAgentId}
                                    onChange={(e) => setSelectedAgentId(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                                >
                                    <option value="">-- Choisissez une agence mandataire partenaire --</option>
                                    {agencies.map(a => {
                                        const name = a.legalEntity?.companyName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Agence Partenaire';
                                        const reg = a.companyRegNumber ? ` (Agrément: ${a.companyRegNumber})` : '';
                                        return (
                                            <option key={a.id} value={a.id}>
                                                {name}{reg}
                                            </option>
                                        );
                                    })}
                                    {agencies.length === 0 && (
                                        <option value="">Agence Immobilière Riviera Agréée (AGR-2021-0133)</option>
                                    )}
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    L&apos;agence désignée sera le gestionnaire mandataire officiel de votre bien.
                                </p>
                            </div>
'''

target_div = '''                                </select>
                            </div>'''

if target_div in code:
    code = code.replace(target_div, target_div + '\n\n' + agency_picker, 1)

with open('src/components/dashboard/mandates/CreateMandateModal.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("CreateMandateModal updated successfully!")
