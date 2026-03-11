import { usePlans } from '@/context/PlanContext'

export default function Pricing() {
  const { plans } = usePlans()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price)
  }

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 xl:px-0">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-[40px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] mb-6 tracking-tight">
            Pilih Paket AI Anda
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Tingkatkan produktivitas dan kreativitas dengan model AI tercanggih kami.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-[24px] p-8 px-6 lg:px-8 border relative flex flex-col ${
                plan.id === 1
                  ? 'border-blue-500 border-2 shadow-lg shadow-blue-100/50'
                  : 'border-gray-200 dark:border-gray-700 shadow-sm'
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-[22px] font-bold text-gray-900 dark:text-white mb-3">
                  {plan.name}
                </h3>
                <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed min-h-[60px]">
                  {plan.description}
                </p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xl font-bold text-gray-400 line-through decoration-1">
                    Rp {formatPrice(plan.price.monthly)}
                  </span>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-[#118A43]">
                      Rp {plan.price.discounted === 0 ? '0' : formatPrice(plan.price.discounted)}
                    </span>
                    <span className="text-xl font-medium text-[#118A43] mb-0.5">/bln</span>
                  </div>
                </div>
                <p className="text-[12px] text-gray-500 font-medium">{plan.billingText}</p>
              </div>

              <div className="mb-10">
                <button className="w-full py-3.5 rounded-full font-bold text-[14px] bg-[#295cce] text-white hover:bg-[#1a4baf] shadow-md hover:shadow-lg transition-all">
                  {plan.buttonText}
                </button>
              </div>

              <div className="flex-1">
                <ul className="space-y-6">
                  {plan.features
                    .filter((f) => f.isIncluded !== false)
                    .map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-0.5 opacity-80">{feature.icon}</div>
                        <div>
                          <h4 className="text-[14px] font-bold text-gray-900 dark:text-white mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-[1.6]">
                            {feature.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
