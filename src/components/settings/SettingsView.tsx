import React, { useState } from 'react';
import {
  Settings,
  Building2,
  MapPin,
  Save,
  CheckCircle,
  Clock,
  PlaneTakeoff,
  Wallet,
  Calculator,
  History,
  Upload,
  Trash2,
  Search,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import { CompanySettings, AuditLog, Workshop, User } from '../../types';
import { StorageService } from '../../services/storage';
import { formatNumberFa } from '../../utils/dateUtils';

interface SettingsViewProps {
  settings: CompanySettings;
  auditLogs: AuditLog[];
  onRefresh: () => void;
  canEdit: boolean;
  currentUser?: User;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  auditLogs,
  onRefresh,
  canEdit,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'AUDIT'>('SETTINGS');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('ALL');

  const [formData, setFormData] = useState<CompanySettings>({
    ...settings,
    companyName: settings.companyName || 'M.GAMMON | مجید نورایی',
    companyCode: settings.companyCode || 'MG-101',
    logoUrl: settings.logoUrl || '',
    allowedGpsRadiusMeters: settings.allowedGpsRadiusMeters || 20,
    defaultWorkStartTime: settings.defaultWorkStartTime || '07:00',
    defaultWorkEndTime: settings.defaultWorkEndTime || '16:00',
    lateToleranceMinutes: settings.lateToleranceMinutes ?? 15,
    annualLeaveDaysQuota: settings.annualLeaveDaysQuota ?? 26,
    maxLeaveRequestsPerWeek: settings.maxLeaveRequestsPerWeek ?? 1,
    allowMultiplePendingLeaves: settings.allowMultiplePendingLeaves ?? false,
    maxHourlyLeaveHoursPerMonth: settings.maxHourlyLeaveHoursPerMonth ?? 16,
    maxAdvanceRequestsPerMonth: settings.maxAdvanceRequestsPerMonth ?? 1,
    advanceWindowStartDay: settings.advanceWindowStartDay ?? 15,
    advanceWindowEndDay: settings.advanceWindowEndDay ?? 20,
    maxAdvanceSalaryPercent: settings.maxAdvanceSalaryPercent ?? 30,
    workDaysPerMonth: settings.workDaysPerMonth ?? 22,
    dailyWorkHours: settings.dailyWorkHours ?? 8,
    overtimeRateMultiplier: settings.overtimeRateMultiplier ?? 1.4,
    insuranceRatePercent: settings.insuranceRatePercent ?? 7,
    taxRatePercent: settings.taxRatePercent ?? 10,
    taxExemptionThreshold: settings.taxExemptionThreshold ?? 14000000,
    fixedHousingAllowance: settings.fixedHousingAllowance ?? 900000,
    fixedGroceryAllowance: settings.fixedGroceryAllowance ?? 1400000,
    workshops: settings.workshops && settings.workshops.length > 0 ? settings.workshops : [
      {
        id: 'ws_1',
        name: 'کارگاه ۱ (اصلی - تولید و ساخت)',
        code: 'کارگاه ۱',
        lat: 35.75750,
        lng: 51.41000,
        allowedRadiusMeters: 20,
        address: 'کارگاه شماره ۱ - سالن اصلی'
      },
      {
        id: 'ws_2',
        name: 'کارگاه ۲ (فرعی - مونتاژ و انبار)',
        code: 'کارگاه ۲',
        lat: 35.75764,
        lng: 51.41015,
        allowedRadiusMeters: 20,
        address: 'کارگاه شماره ۲ - واحد مجاور'
      }
    ]
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(formData);
    const actorName = currentUser?.name || 'مدیریت';
    const actorRole = currentUser?.role || 'ADMIN';
    StorageService.addAuditLog(
      'به‌روزرسانی تنظیمات برنامه',
      'تنظیمات',
      `ویرایش قوانین زمان‌بندی، سقف‌های مرخصی و دستمزد توسط ${actorName} (${actorRole})`
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefresh();
  };

  const handleUpdateWorkshop = (index: number, field: keyof Workshop, value: any) => {
    const updated = [...formData.workshops];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, workshops: updated });
  };

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(auditSearch.toLowerCase());
    const matchFilter = auditFilter === 'ALL' || log.resource === auditFilter;
    return matchSearch && matchFilter;
  });

  const uniqueResources = ['ALL', ...Array.from(new Set(auditLogs.map((l) => l.resource)))];

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>تنظیمات برنامه</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تعیین قوانین کاری، ساعات کاری از ۷:۰۰ صبح، سقف‌های مرخصی، پنجره مساعده و ردپای فعالیت مدیران
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'SETTINGS'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تنظیمات برنامه
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'AUDIT'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ردپای رویدادها و لاگ مدیران ({auditLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'SETTINGS' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تنظیمات برنامه و قوانین کارگاه با موفقیت ذخیره گردید.</span>
            </div>
          )}

          {/* Section 1: Brand & Logo */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>مشخصات مجموعه و برندینگ</span>
            </h3>

            {/* Commercial Logo Card */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="لوگوی برنامه"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    لوگوی رسمی برنامه
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    نمایش در سربرگ سامانه، فرم‌ها و گزارش‌های رسمی کارگاه
                  </p>
                </div>
              </div>

              {canEdit && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>بارگذاری لوگو</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-rose-200 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف لوگو</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  نام مجموعه و عنوان برنامه
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  کد شناسایی کارگاه
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={formData.companyCode}
                  onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">تلفن کارگاه</label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">نشانی کارگاه</label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Work Schedule & Timing Patterns (ساعت کاری از ۷:۰۰) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>الگوی زمان‌بندی و ساعات کار رسمی</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ساعت شروع به کار کارگاه (صبح)
                </label>
                <input
                  type="time"
                  disabled={!canEdit}
                  value={formData.defaultWorkStartTime || '07:00'}
                  onChange={(e) => setFormData({ ...formData, defaultWorkStartTime: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  شروع کار پیش‌فرض از ساعت ۷ صبح
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ساعت پایان کار کارگاه
                </label>
                <input
                  type="time"
                  disabled={!canEdit}
                  value={formData.defaultWorkEndTime || '16:00'}
                  onChange={(e) => setFormData({ ...formData, defaultWorkEndTime: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  ساعت رسمی خاتمه شیفت روزانه
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  میزان مجاز تأخیر ورود (دقیقه)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.lateToleranceMinutes}
                  onChange={(e) => setFormData({ ...formData, lateToleranceMinutes: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  تاخیر تا این مقدار مشمول جریمه نخواهد شد
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Leave Rules (قوانین مرخصی) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <PlaneTakeoff className="w-4 h-4 text-indigo-600" />
              <span>قوانین و محدودیت‌های ثبت مرخصی پرسنل</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  سقف مرخصی استحقاقی سالانه (روز)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.annualLeaveDaysQuota}
                  onChange={(e) => setFormData({ ...formData, annualLeaveDaysQuota: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  حداکثر دفعات درخواست مرخصی در هفته
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.maxLeaveRequestsPerWeek}
                  onChange={(e) => setFormData({ ...formData, maxLeaveRequestsPerWeek: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  هفتگی ۱ بار امکان درخواست مرخصی
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  سقف مرخصی ساعتی ماهانه (ساعت)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.maxHourlyLeaveHoursPerMonth}
                  onChange={(e) => setFormData({ ...formData, maxHourlyLeaveHoursPerMonth: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={!formData.allowMultiplePendingLeaves}
                  onChange={(e) => setFormData({ ...formData, allowMultiplePendingLeaves: !e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800">
                  ممانعت از ثبت درخواست مرخصی جدید در صورت وجود درخواست باز (عدم ارسال درخواست پشت سر هم)
                </span>
              </label>
              <p className="text-[11px] text-slate-400 mr-6 mt-0.5">
                تا زمانی که مدیر درخواست قبلی کارمند را تأیید یا رد نکرده باشد، ثبت درخواست جدید غیرفعال خواهد بود.
              </p>
            </div>
          </div>

          {/* Section 4: Advance Salary Rules (قوانین مساعده مالی) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Wallet className="w-4 h-4 text-indigo-600" />
              <span>قوانین و پنجره زمانی درخواست مساعده مالی</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  روز شروع پنجره مساعده در ماه
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  disabled={!canEdit}
                  value={formData.advanceWindowStartDay}
                  onChange={(e) => setFormData({ ...formData, advanceWindowStartDay: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  فعال شدن در نیمه ماه (روز ۱۵)
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  روز پایان پنجره مساعده در ماه
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  disabled={!canEdit}
                  value={formData.advanceWindowEndDay}
                  onChange={(e) => setFormData({ ...formData, advanceWindowEndDay: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  خاتمه مهلت درخواست (روز ۲۰)
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  سقف مجاز مساعده (درصد از حقوق پایه)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  disabled={!canEdit}
                  value={formData.maxAdvanceSalaryPercent}
                  onChange={(e) => setFormData({ ...formData, maxAdvanceSalaryPercent: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  حداکثر تا ۳۰٪ حقوق پایه ماهانه
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Payroll & Calculations (اساس محاسبات حقوق) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>اساس و ضرایب محاسبات حقوق و دستمزد</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  تعداد روزهای موظفی کار در ماه
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.workDaysPerMonth}
                  onChange={(e) => setFormData({ ...formData, workDaysPerMonth: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ساعات کار موظف روزانه
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.dailyWorkHours}
                  onChange={(e) => setFormData({ ...formData, dailyWorkHours: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ضریب ساعت اضافه‌کاری
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!canEdit}
                  value={formData.overtimeRateMultiplier}
                  onChange={(e) => setFormData({ ...formData, overtimeRateMultiplier: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  معادل ۱.۴ نرخ ساعتی کار عادی
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  نرخ سهم بیمه کارگر (٪)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.insuranceRatePercent}
                  onChange={(e) => setFormData({ ...formData, insuranceRatePercent: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  کسر قانونی ۷٪ تأمین اجتماعی
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  کمک‌هزینه مسکن ماهانه (تومان)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.fixedHousingAllowance}
                  onChange={(e) => setFormData({ ...formData, fixedHousingAllowance: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  بن خواربار کارگری (تومان)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.fixedGroceryAllowance}
                  onChange={(e) => setFormData({ ...formData, fixedGroceryAllowance: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Workshops & Geofencing (20m radius) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>موقعیت مکانی و محدوده ۲۰ متری کارگاه‌ها</span>
              </h3>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                شعاع تردد مجاز: ۲۰ متر
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.workshops.map((ws, idx) => (
                <div key={ws.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{ws.name}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {ws.code}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">نشانی کارگاه</label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={ws.address || ''}
                      onChange={(e) => handleUpdateWorkshop(idx, 'address', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">عرض جغرافیایی (Lat)</label>
                      <input
                        type="number"
                        step="0.00001"
                        disabled={!canEdit}
                        value={ws.lat}
                        onChange={(e) => handleUpdateWorkshop(idx, 'lat', Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">طول جغرافیایی (Lng)</label>
                      <input
                        type="number"
                        step="0.00001"
                        disabled={!canEdit}
                        value={ws.lng}
                        onChange={(e) => handleUpdateWorkshop(idx, 'lng', Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canEdit && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره کلیه تنظیمات و قوانین برنامه</span>
              </button>
            </div>
          )}
        </form>
      ) : (
        /* AUDIT LOGS & HR TRACEABILITY TAB */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span>ردپای رویدادها، اقدامات و لاگ مدیران (Audit Trail)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ثبت کلیه اقدامات مدیر منابع انسانی و مدیر ارشد جهت بررسی خطاها، پیگیری تغییرات و شفافیت سازمانی
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="جستجو در شرح، اقدام یا نام مدیر..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white text-slate-700 focus:outline-none"
              >
                {uniqueResources.map((r) => (
                  <option key={r} value={r}>
                    {r === 'ALL' ? 'همه بخش‌ها' : r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredAuditLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                موردی مطابق با جستجو یا فیلتر انتخابی یافت نشد.
              </div>
            ) : (
              filteredAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                        {log.resource}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{log.details}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="font-semibold text-slate-600">اقدام توسط: {log.userName}</span>
                      {log.ipAddress && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{log.ipAddress}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono shrink-0 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    {log.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
