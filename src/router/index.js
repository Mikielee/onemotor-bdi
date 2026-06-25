import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/step/1' },
  {
    path: '/step/1',
    name: 'step-1-cover-type',
    component: () => import('../views/Step01CoverType.vue'),
    meta: { step: 1, group: 0, omp: 'OMP-87', title: 'Cover Type' },
  },
  {
    path: '/step/2',
    name: 'step-2-cover-start-date',
    component: () => import('../views/Step02CoverStartDate.vue'),
    meta: { step: 2, group: 0, omp: 'OMP-88', title: 'Cover Start Date' },
  },
  {
    path: '/step/3',
    name: 'step-3-year-make-model',
    component: () => import('../views/Step03YearMakeModel.vue'),
    meta: { step: 3, group: 0, omp: 'OMP-89', title: 'Year, Make & Model' },
  },
  {
    path: '/step/4',
    name: 'step-4-car-usage',
    component: () => import('../views/Step04CarUsage.vue'),
    meta: { step: 4, group: 0, omp: 'OMP-90', title: 'Car Usage' },
  },
  {
    path: '/step/5',
    name: 'step-5-annual-distance',
    component: () => import('../views/Step05AnnualDistance.vue'),
    meta: { step: 5, group: 0, omp: 'OMP-91', title: 'Annual Distance' },
  },
  {
    path: '/step/6',
    name: 'step-6-main-driver',
    component: () => import('../views/Step06MainDriver.vue'),
    meta: { step: 6, group: 1, omp: 'OMP-92', title: 'Main Driver' },
  },
  {
    path: '/step/7',
    name: 'step-7-driving-history',
    component: () => import('../views/Step07DrivingHistory.vue'),
    meta: { step: 7, group: 1, omp: 'OMP-93', title: 'Driving History' },
  },
  {
    path: '/step/8',
    name: 'step-8-policyholder-contact',
    component: () => import('../views/Step08PolicyholderContact.vue'),
    meta: { step: 8, group: 1, omp: 'OMP-94', title: 'Policyholder Contact' },
  },
  {
    path: '/step/9',
    name: 'step-9-your-quote',
    component: () => import('../views/Step09YourQuote.vue'),
    meta: { step: 9, group: 2, omp: 'OMP-305', title: 'Your Quote' },
  },
  {
    path: '/step/10',
    name: 'step-10-additional-drivers',
    component: () => import('../views/Step10AdditionalDrivers.vue'),
    meta: { step: 10, group: 2, omp: 'OMP-361', title: 'Additional Drivers' },
  },
  {
    path: '/step/11',
    name: 'step-11-optional-benefits',
    component: () => import('../views/Step11OptionalBenefits.vue'),
    meta: { step: 11, group: 2, omp: 'OMP-362', title: 'Optional Benefits' },
  },
  {
    path: '/step/12',
    name: 'step-12-policyholder-details',
    component: () => import('../views/Step12PolicyholderDetails.vue'),
    meta: { step: 12, group: 3, omp: 'OMP-651', title: 'Policyholder Additional Details' },
  },
  {
    path: '/step/13',
    name: 'step-13-vehicle-details',
    component: () => import('../views/Step13VehicleDetails.vue'),
    meta: { step: 13, group: 3, omp: 'OMP-652', title: 'Vehicle Details' },
  },
  {
    path: '/step/14',
    name: 'step-14-policy-summary',
    component: () => import('../views/Step14PolicySummary.vue'),
    meta: { step: 14, group: 3, omp: 'OMP-653', title: 'Policy Summary' },
  },
  {
    path: '/step/15',
    name: 'step-15-payment',
    component: () => import('../views/Step15Payment.vue'),
    meta: { step: 15, group: 3, omp: 'OMP-654', title: 'Payment Options' },
  },
  {
    path: '/step/16',
    name: 'step-16-paynow-qr',
    component: () => import('../views/Step16PayNowQR.vue'),
    meta: { step: 16, group: 3, omp: 'OMP-655', title: 'PayNow QR' },
  },
  {
    path: '/step/17',
    name: 'step-17-confirmation',
    component: () => import('../views/Step17Confirmation.vue'),
    meta: { step: 17, group: 3, omp: 'OMP-656', title: 'Confirmation' },
  },
  {
    // Mock card-payment gateway. Sits outside the step counter — in a
    // real flow this is the external Stripe/Adyen/2C2P hosted page.
    path: '/payment/gateway',
    name: 'payment-gateway',
    component: () => import('../views/PaymentGateway.vue'),
    meta: { title: 'Secure Payment' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/step/1' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `Step ${to.meta.step} · ${to.meta.title} · Budget Direct Insurance`
  }
})

export default router
