
-- enums
CREATE TYPE public.app_role AS ENUM ('admin','manager','sales','finance','viewer');
CREATE TYPE public.case_status AS ENUM (
 'received','awaiting_info','awaiting_supplier_quote','tech_proposal_prep','tech_proposal_sent',
 'fin_proposal_prep','fin_proposal_sent','won','purchasing','receivables','on_hold','lost','closed');
CREATE TYPE public.priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.task_status AS ENUM ('todo','in_progress','done','cancelled');
CREATE TYPE public.invoice_status AS ENUM ('draft','sent','paid','partially_paid','overdue');
CREATE TYPE public.proposal_kind AS ENUM ('technical','financial');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  job_title text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_self_write" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'sales') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

-- roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_read" ON public.user_roles FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role);
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- organizations
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  country text,
  city text,
  website text,
  phone text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  job_title text,
  email text,
  phone text,
  tags text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  responsible_name text,
  responsible_user_id uuid,
  status public.case_status NOT NULL DEFAULT 'received',
  priority public.priority NOT NULL DEFAULT 'medium',
  value numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  exchange_rate numeric(14,4),
  source text,
  due_date date,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assignee_name text,
  assignee_user_id uuid,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.priority NOT NULL DEFAULT 'medium',
  due_date date,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  type text NOT NULL,
  actor_name text,
  actor_user_id uuid,
  content text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  folder text NOT NULL DEFAULT 'inbox',
  sender text NOT NULL,
  recipient text NOT NULL,
  subject text NOT NULL,
  body text,
  has_attachments boolean NOT NULL DEFAULT false,
  is_read boolean NOT NULL DEFAULT false,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  name text NOT NULL,
  doc_type text,
  version int NOT NULL DEFAULT 1,
  size_kb int NOT NULL DEFAULT 0,
  created_by text,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  proposal_number text NOT NULL,
  kind public.proposal_kind NOT NULL,
  version int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft',
  currency text NOT NULL DEFAULT 'EUR',
  total numeric(14,2) NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  paid_amount numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  issue_date date NOT NULL DEFAULT current_date,
  due_date date,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  incoterm text,
  quantity text,
  delivery_date date,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations, public.contacts, public.cases, public.tasks, public.activities, public.emails, public.documents, public.proposals, public.invoices, public.deliveries TO authenticated;
GRANT ALL ON public.organizations, public.contacts, public.cases, public.tasks, public.activities, public.emails, public.documents, public.proposals, public.invoices, public.deliveries TO service_role;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_all" ON public.organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "contacts_all" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cases_all" ON public.cases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tasks_all" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "activities_all" ON public.activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "emails_all" ON public.emails FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "documents_all" ON public.documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "proposals_all" ON public.proposals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "invoices_all" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "deliveries_all" ON public.deliveries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER trg_org_upd BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_contacts_upd BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cases_upd BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tasks_upd BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== demo data =====
INSERT INTO public.organizations (id, name, industry, country, city, website, phone, tags) VALUES
('11111111-1111-1111-1111-111111111101','فولاد مبارکه اصفهان','فولاد','ایران','اصفهان','msc.ir','+98 31 3344 5566','{"کلیدی","دولتی"}'),
('11111111-1111-1111-1111-111111111102','پتروشیمی بندر امام','پتروشیمی','ایران','ماهشهر','bipc.ir','+98 61 5233 1100','{"کلیدی"}'),
('11111111-1111-1111-1111-111111111103','سیمان تهران','سیمان','ایران','تهران','tehrancement.com','+98 21 8877 2211','{}'),
('11111111-1111-1111-1111-111111111104','Siemens Energy AG','تجهیزات صنعتی','آلمان','برلین','siemens-energy.com','+49 30 1234 5678','{"تامین‌کننده"}'),
('11111111-1111-1111-1111-111111111105','مس سرچشمه','معدن','ایران','کرمان','nicico.com','+98 34 3122 4400','{"کلیدی"}'),
('11111111-1111-1111-1111-111111111106','آلومینیوم المهدی','فلزات','ایران','بندرعباس','almahdi.ir','+98 76 3355 1200','{}');

INSERT INTO public.contacts (id, organization_id, full_name, job_title, email, phone, tags, notes) VALUES
('22222222-2222-2222-2222-222222222201','11111111-1111-1111-1111-111111111101','مهندس علی رضایی','مدیر خرید','a.rezaei@msc.ir','+98 912 111 2233','{"تصمیم‌گیرنده"}','ارتباط از طریق ایمیل ترجیح داده می‌شود.'),
('22222222-2222-2222-2222-222222222202','11111111-1111-1111-1111-111111111102','مهندس سارا احمدی','کارشناس فنی','s.ahmadi@bipc.ir','+98 913 222 3344','{}','مسئول بررسی مشخصات فنی.'),
('22222222-2222-2222-2222-222222222203','11111111-1111-1111-1111-111111111103','محمد کاظمی','مدیر بازرگانی','m.kazemi@tehrancement.com','+98 912 555 6677','{"مالی"}',null),
('22222222-2222-2222-2222-222222222204','11111111-1111-1111-1111-111111111104','Klaus Meyer','Sales Director','k.meyer@siemens-energy.com','+49 170 888 1122','{"تامین‌کننده"}',null),
('22222222-2222-2222-2222-222222222205','11111111-1111-1111-1111-111111111105','مهندس نرگس صادقی','رئیس تعمیرات','n.sadeghi@nicico.com','+98 913 444 5566','{}',null),
('22222222-2222-2222-2222-222222222206','11111111-1111-1111-1111-111111111106','رضا موسوی','کارشناس خرید','r.mousavi@almahdi.ir','+98 917 333 4455','{}',null);

INSERT INTO public.cases (id, case_number, title, description, organization_id, contact_id, responsible_name, status, priority, value, currency, source, due_date, last_activity_at) VALUES
('33333333-3333-3333-3333-333333333301','PR-1404-0001','تامین ۴۰ عدد شیر کنترل پنوماتیک','درخواست خرید شیرهای کنترل پنوماتیک جهت خط نورد گرم.','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222201','مهدی نوروزی','received','high',185000,'EUR','ایمیل','2026-09-20', now() - interval '2 hours'),
('33333333-3333-3333-3333-333333333302','PR-1404-0002','خرید یاتاقان‌های صنعتی SKF','تامین یاتاقان‌های ویژه توربین گاز.','11111111-1111-1111-1111-111111111102','22222222-2222-2222-2222-222222222202','زهرا کریمی','awaiting_info','medium',94500,'EUR','تماس تلفنی','2026-09-05', now() - interval '1 day'),
('33333333-3333-3333-3333-333333333303','PR-1404-0003','تامین سیستم پایش ارتعاش','پکیج کامل پایش وضعیت ماشین‌آلات دوار.','11111111-1111-1111-1111-111111111105','22222222-2222-2222-2222-222222222205','مهدی نوروزی','awaiting_supplier_quote','urgent',320000,'USD','نمایشگاه','2026-08-30', now() - interval '5 hours'),
('33333333-3333-3333-3333-333333333304','PR-1404-0004','قطعات یدکی کوره دوار','قطعات یدکی مصرفی کوره خط ۲.','11111111-1111-1111-1111-111111111103','22222222-2222-2222-2222-222222222203','امیر شریفی','tech_proposal_prep','medium',56000,'EUR','ایمیل','2026-09-12', now() - interval '3 days'),
('33333333-3333-3333-3333-333333333305','PR-1404-0005','الکتروموتور ضدانفجار ۲۵۰kW','مطابق استاندارد ATEX.','11111111-1111-1111-1111-111111111102','22222222-2222-2222-2222-222222222202','زهرا کریمی','tech_proposal_sent','high',142000,'EUR','ایمیل','2026-08-28', now() - interval '8 hours'),
('33333333-3333-3333-3333-333333333306','PR-1404-0006','ابزار دقیق ترانسمیتر فشار','۱۲۰ عدد ترانسمیتر فشار روزمونت.','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222201','امیر شریفی','fin_proposal_prep','medium',78000,'USD','وب‌سایت','2026-09-25', now() - interval '2 days'),
('33333333-3333-3333-3333-333333333307','PR-1404-0007','پمپ‌های سانتریفیوژ فرآیندی','۶ دستگاه پمپ API 610.','11111111-1111-1111-1111-111111111106','22222222-2222-2222-2222-222222222206','مهدی نوروزی','fin_proposal_sent','high',265000,'EUR','معرفی','2026-08-22', now() - interval '20 hours'),
('33333333-3333-3333-3333-333333333308','PR-1404-0008','تابلو برق MV و تجهیزات جانبی','تابلوهای ۲۰ کیلوولت.','11111111-1111-1111-1111-111111111105','22222222-2222-2222-2222-222222222205','زهرا کریمی','won','urgent',430000,'EUR','مناقصه','2026-10-10', now() - interval '4 days'),
('33333333-3333-3333-3333-333333333309','PR-1404-0009','سیستم روانکاری مرکزی','طراحی و تامین سیستم روانکاری.','11111111-1111-1111-1111-111111111103','22222222-2222-2222-2222-222222222203','امیر شریفی','purchasing','medium',119000,'EUR','ایمیل','2026-09-30', now() - interval '6 days'),
('33333333-3333-3333-3333-333333333310','PR-1404-0010','تجهیزات ابزار دقیق آنالایزر','آنالایزر گاز دودکش.','11111111-1111-1111-1111-111111111102','22222222-2222-2222-2222-222222222202','مهدی نوروزی','receivables','high',97000,'USD','ایمیل','2026-07-15', now() - interval '9 days'),
('33333333-3333-3333-3333-333333333311','PR-1404-0011','گیربکس صنعتی سنگین','گیربکس خط انتقال مواد.','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222201','زهرا کریمی','on_hold','low',64000,'EUR','تماس تلفنی','2026-11-01', now() - interval '14 days'),
('33333333-3333-3333-3333-333333333312','PR-1404-0012','کمپرسور اسکرو ۳۰۰ کیلووات','نیاز به مشاوره فنی.','11111111-1111-1111-1111-111111111106','22222222-2222-2222-2222-222222222206','امیر شریفی','lost','medium',210000,'EUR','ایمیل','2026-06-20', now() - interval '30 days'),
('33333333-3333-3333-3333-333333333313','PR-1404-0013','فیلترهای صنعتی هوا','تامین فیلترهای HEPA صنعتی.','11111111-1111-1111-1111-111111111105','22222222-2222-2222-2222-222222222205','مهدی نوروزی','closed','low',33000,'EUR','وب‌سایت','2026-05-30', now() - interval '45 days'),
('33333333-3333-3333-3333-333333333314','PR-1404-0014','ولوهای اطمینان ایمنی','PSV مطابق ASME.','11111111-1111-1111-1111-111111111102','22222222-2222-2222-2222-222222222202','زهرا کریمی','received','medium',48000,'EUR','ایمیل','2026-09-18', now() - interval '30 minutes'),
('33333333-3333-3333-3333-333333333315','PR-1404-0015','سیستم اسکادا و کنترل','ارتقای سیستم کنترل خط تولید.','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222201','امیر شریفی','won','urgent',512000,'USD','مناقصه','2026-12-01', now() - interval '1 day');

INSERT INTO public.tasks (case_id, title, description, assignee_name, status, priority, due_date, checklist) VALUES
('33333333-3333-3333-3333-333333333301','دریافت دیتاشیت از مشتری','درخواست مشخصات فنی دقیق شیرها','مهدی نوروزی','todo','high','2026-08-21','[{"t":"ارسال ایمیل","d":true},{"t":"پیگیری تلفنی","d":false}]'),
('33333333-3333-3333-3333-333333333303','استعلام از سه تامین‌کننده','ارسال RFQ به تامین‌کنندگان اروپایی','مهدی نوروزی','in_progress','urgent','2026-08-20','[{"t":"Siemens","d":true},{"t":"SKF","d":false}]'),
('33333333-3333-3333-3333-333333333305','پیگیری پیشنهاد فنی ارسال‌شده','تماس با مشتری جهت بازخورد','زهرا کریمی','todo','medium','2026-08-24','[]'),
('33333333-3333-3333-3333-333333333307','آماده‌سازی مذاکره قیمت','بررسی حاشیه سود','مهدی نوروزی','in_progress','high','2026-08-19','[]'),
('33333333-3333-3333-3333-333333333308','ارسال پیش‌فاکتور نهایی','صدور پروفرما','زهرا کریمی','done','high','2026-08-12','[]'),
('33333333-3333-3333-3333-333333333309','هماهنگی حمل و ترخیص','با شرکت فورواردر','امیر شریفی','in_progress','medium','2026-09-02','[]'),
('33333333-3333-3333-3333-333333333310','پیگیری وصول مطالبات','فاکتور سررسید گذشته','امیر شریفی','todo','urgent','2026-08-19','[]'),
('33333333-3333-3333-3333-333333333315','برگزاری جلسه کیک‌آف','با تیم فنی مشتری','امیر شریفی','todo','high','2026-08-26','[]');

INSERT INTO public.activities (case_id, type, actor_name, content, created_at) VALUES
('33333333-3333-3333-3333-333333333301','case_created','مهدی نوروزی','پرونده ایجاد شد.', now() - interval '3 days'),
('33333333-3333-3333-3333-333333333301','email','سیستم','ایمیل درخواست از مشتری دریافت شد.', now() - interval '2 days'),
('33333333-3333-3333-3333-333333333301','comment','مهدی نوروزی','منتظر دیتاشیت دقیق از سمت مشتری هستیم.', now() - interval '2 hours'),
('33333333-3333-3333-3333-333333333303','status_change','مهدی نوروزی','وضعیت به «منتظر دریافت پیشنهاد» تغییر کرد.', now() - interval '5 hours'),
('33333333-3333-3333-3333-333333333303','call','مهدی نوروزی','تماس با تامین‌کننده آلمانی انجام شد.', now() - interval '1 day'),
('33333333-3333-3333-3333-333333333305','proposal','زهرا کریمی','پیشنهاد فنی نسخه ۲ ارسال شد.', now() - interval '8 hours'),
('33333333-3333-3333-3333-333333333307','proposal','مهدی نوروزی','پیشنهاد مالی برای مشتری ارسال شد.', now() - interval '20 hours'),
('33333333-3333-3333-3333-333333333308','status_change','زهرا کریمی','پرونده برنده شد.', now() - interval '4 days'),
('33333333-3333-3333-3333-333333333309','delivery','امیر شریفی','بارگیری از مبدا انجام شد.', now() - interval '6 days'),
('33333333-3333-3333-3333-333333333310','payment','امیر شریفی','پرداخت جزئی به مبلغ ۴۰,۰۰۰ دلار ثبت شد.', now() - interval '9 days'),
('33333333-3333-3333-3333-333333333315','task','امیر شریفی','وظیفه جلسه کیک‌آف ایجاد شد.', now() - interval '1 day');

INSERT INTO public.emails (case_id, folder, sender, recipient, subject, body, has_attachments, is_read, sent_at) VALUES
('33333333-3333-3333-3333-333333333301','inbox','a.rezaei@msc.ir','sales@company.ir','درخواست استعلام PR-1404-0001','لطفا قیمت و زمان تحویل شیرهای کنترل را اعلام فرمایید.',true,false, now() - interval '2 days'),
('33333333-3333-3333-3333-333333333305','sent','sales@company.ir','s.ahmadi@bipc.ir','پیشنهاد فنی PR-1404-0005','پیشنهاد فنی نسخه ۲ پیوست است.',true,true, now() - interval '8 hours'),
('33333333-3333-3333-3333-333333333307','sent','sales@company.ir','r.mousavi@almahdi.ir','پیشنهاد مالی PR-1404-0007','قیمت نهایی و شرایط پرداخت.',true,true, now() - interval '20 hours'),
(null,'inbox','info@newsupplier.com','sales@company.ir','معرفی محصولات جدید','کاتالوگ محصولات ۲۰۲۶.',false,false, now() - interval '4 hours'),
('33333333-3333-3333-3333-333333333310','inbox','s.ahmadi@bipc.ir','finance@company.ir','پیگیری فاکتور PR-1404-0010','پرداخت باقیمانده هفته آینده انجام می‌شود.',false,true, now() - interval '3 days'),
(null,'drafts','sales@company.ir','k.meyer@siemens-energy.com','RFQ for control valves','Draft in progress.',false,true, now() - interval '1 day');

INSERT INTO public.documents (case_id, name, doc_type, version, size_kb, created_by) VALUES
('33333333-3333-3333-3333-333333333301','datasheet-control-valve.pdf','دیتاشیت',1,842,'مهدی نوروزی'),
('33333333-3333-3333-3333-333333333305','technical-proposal-v2.pdf','پیشنهاد فنی',2,1560,'زهرا کریمی'),
('33333333-3333-3333-3333-333333333305','technical-proposal-v1.pdf','پیشنهاد فنی',1,1490,'زهرا کریمی'),
('33333333-3333-3333-3333-333333333307','financial-proposal.pdf','پیشنهاد مالی',1,720,'مهدی نوروزی'),
('33333333-3333-3333-3333-333333333308','contract-signed.pdf','قرارداد',1,2310,'زهرا کریمی'),
('33333333-3333-3333-3333-333333333309','packing-list.xlsx','اسناد حمل',1,96,'امیر شریفی');

INSERT INTO public.proposals (case_id, proposal_number, kind, version, status, currency, total, created_by) VALUES
('33333333-3333-3333-3333-333333333305','TP-1404-011','technical',2,'sent','EUR',142000,'زهرا کریمی'),
('33333333-3333-3333-3333-333333333304','TP-1404-012','technical',1,'draft','EUR',56000,'امیر شریفی'),
('33333333-3333-3333-3333-333333333307','FP-1404-021','financial',1,'sent','EUR',265000,'مهدی نوروزی'),
('33333333-3333-3333-3333-333333333306','FP-1404-022','financial',1,'draft','USD',78000,'امیر شریفی'),
('33333333-3333-3333-3333-333333333308','FP-1404-023','financial',3,'accepted','EUR',430000,'زهرا کریمی');

INSERT INTO public.invoices (case_id, invoice_number, amount, paid_amount, currency, issue_date, due_date, status) VALUES
('33333333-3333-3333-3333-333333333308','INV-1404-101',430000,430000,'EUR','2026-06-10','2026-07-10','paid'),
('33333333-3333-3333-3333-333333333309','INV-1404-102',119000,60000,'EUR','2026-07-01','2026-08-01','partially_paid'),
('33333333-3333-3333-3333-333333333310','INV-1404-103',97000,40000,'USD','2026-06-15','2026-07-15','overdue'),
('33333333-3333-3333-3333-333333333315','INV-1404-104',256000,0,'USD','2026-08-01','2026-09-01','sent'),
('33333333-3333-3333-3333-333333333313','INV-1404-105',33000,33000,'EUR','2026-05-20','2026-06-20','paid');

INSERT INTO public.deliveries (case_id, incoterm, quantity, delivery_date, status) VALUES
('33333333-3333-3333-3333-333333333309','CIF بندرعباس','۱ ست کامل','2026-09-15','در حال حمل'),
('33333333-3333-3333-3333-333333333308','FOB هامبورگ','۴ تابلو','2026-10-05','در انتظار تولید'),
('33333333-3333-3333-3333-333333333313','EXW','۲۰۰ عدد','2026-06-05','تحویل شده');
