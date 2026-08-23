import { useNavigate } from 'react-router-dom';
import { AccountVerification } from '@/components/creator/AccountVerification';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useInstagramAccount } from '@/hooks/useSocialAccounts';
import { logout } from '@/utils/auth';

export default function CreatorSettings() {
    const navigate = useNavigate();
    const { data: user } = useAuthUser();
    const { instagram } = useInstagramAccount();

    return (
        <div className="mx-auto max-w-[760px]">
            <div className="mb-5">
                <h1 className="mb-1.5 text-[31px] font-extrabold leading-[1.06] tracking-[-1.3px]">Settings</h1>
                <p className="m-0 text-[13px] text-[#777a83]">Manage verification, connected accounts and your login.</p>
            </div>

            <AccountVerification />

            <div className="space-y-4">
                <div className="rounded-[18px] border border-[#e9e9ef] bg-white p-5">
                    <div className="mb-1 text-[10px] font-extrabold uppercase tracking-[1.1px] text-[#8b8d95]">Account</div>
                    <p className="text-sm font-bold">{user?.name || 'Creator'}</p>
                    <p className="text-[12px] text-[#8b8d95]">{user?.email}</p>
                    {user?.phone && <p className="text-[12px] text-[#8b8d95]">+91 {user.phone}</p>}
                </div>

                <div className="rounded-[18px] border border-[#e9e9ef] bg-white p-5">
                    <div className="mb-1 text-[10px] font-extrabold uppercase tracking-[1.1px] text-[#8b8d95]">Instagram</div>
                    {instagram ? (
                        <p className="text-sm">
                            Connected as <strong>@{instagram.username}</strong>
                        </p>
                    ) : (
                        <p className="text-sm text-[#8b8d95]">Instagram was connected during onboarding and is still syncing.</p>
                    )}
                </div>

                <div className="rounded-[18px] border border-[#e9e9ef] bg-white p-5">
                    <div className="mb-3 text-[10px] font-extrabold uppercase tracking-[1.1px] text-[#8b8d95]">Shortcuts</div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => navigate('/creator/profile')} className="rounded-[9px] border border-[#e9e9ef] px-3 py-2 text-[11px] font-bold">
                            Edit profile
                        </button>
                        <button type="button" onClick={() => navigate('/creator/media-kit')} className="rounded-[9px] border border-[#e9e9ef] px-3 py-2 text-[11px] font-bold">
                            Media kit
                        </button>
                        <button type="button" onClick={() => navigate('/creator/payments')} className="rounded-[9px] border border-[#e9e9ef] px-3 py-2 text-[11px] font-bold">
                            Earnings
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => logout(navigate)}
                    className="w-full rounded-[10px] bg-[#111318] py-3 text-[12px] font-extrabold text-white"
                >
                    Log out
                </button>
            </div>
        </div>
    );
}
