import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Clock3,
  Search,
  Filter,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  ChevronRight,
  Star,
  Shield,
  Zap,
  FileText,
  MessageCircle,
  Copy,
} from "lucide-react";

const MOCK_LEADS = [
  { id: "001", name: "Carlos Eduardo Silva", cpf: "453.***.***-92", valor: 12500, status: "aprovado", banco: "Itaú", prazo: 24, parcela: 687, score: 785, data: "04/06/2026" },
  { id: "002", name: "Maria Fernanda Costa", cpf: "382.***.***-11", valor: 8900, status: "analise", banco: "Nubank", prazo: 18, parcela: 542, score: 720, data: "04/06/2026" },
  { id: "003", name: "João Pedro Oliveira", cpf: "511.***.***-88", valor: 25000, status: "aprovado", banco: "Bradesco", prazo: 36, parcela: 925, score: 812, data: "03/06/2026" },
  { id: "004", name: "Ana Beatriz Santos", cpf: "298.***.***-45", valor: 5600, status: "reprovado", banco: "Inter", prazo: 12, parcela: 520, score: 450, data: "03/06/2026" },
  { id: "005", name: "Lucas Henrique Lima", cpf: "607.***.***-33", valor: 18700, status: "analise", banco: "Santander", prazo: 30, parcela: 730, score: 690, data: "02/06/2026" },
  { id: "006", name: "Juliana Pereira Alves", cpf: "344.***.***-67", valor: 34000, status: "aprovado", banco: "Caixa", prazo: 48, parcela: 890, score: 834, data: "02/06/2026" },
  { id: "007", name: "Ricardo Mendes Souza", cpf: "529.***.***-19", valor: 7800, status: "analise", banco: "Itaú", prazo: 18, parcela: 475, score: 675, data: "01/06/2026" },
  { id: "008", name: "Patrícia Ribeiro Dias", cpf: "461.***.***-22", valor: 42000, status: "aprovado", banco: "Bradesco", prazo: 60, parcela: 1050, score: 890, data: "01/06/2026" },
  { id: "009", name: "Fernando Gomes Cruz", cpf: "573.***.***-77", valor: 15000, status: "reprovado", banco: "Nubank", prazo: 24, parcela: 780, score: 380, data: "31/05/2026" },
  { id: "010", name: "Camila Rodrigues Lopes", cpf: "412.***.***-55", valor: 22500, status: "analise", banco: "Santander", prazo: 36, parcela: 685, score: 710, data: "31/05/2026" },
  { id: "011", name: "Marcos Vinícius Nunes", cpf: "685.***.***-44", valor: 9800, status: "aprovado", banco: "Inter", prazo: 18, parcela: 598, score: 765, data: "30/05/2026" },
  { id: "012", name: "Bruna Ferreira Lima", cpf: "337.***.***-81", valor: 31000, status: "aprovado", banco: "Caixa", prazo: 48, parcela: 765, score: 845, data: "30/05/2026" },
  { id: "013", name: "Gabriel Almeida Torres", cpf: "556.***.***-28", valor: 6700, status: "analise", banco: "Itaú", prazo: 12, parcela: 612, score: 640, data: "29/05/2026" },
  { id: "014", name: "Larissa Martins Cardoso", cpf: "489.***.***-66", valor: 45000, status: "aprovado", banco: "Bradesco", prazo: 60, parcela: 1125, score: 920, data: "29/05/2026" },
  { id: "015", name: "Pedro Henrique Dias", cpf: "623.***.***-99", valor: 11200, status: "reprovado", banco: "Nubank", prazo: 24, parcela: 520, score: 420, data: "28/05/2026" },
];

const BANKS = [
  { name: "Itaú", color: "bg-orange-500", taxa: 1.89 },
  { name: "Bradesco", color: "bg-red-600", taxa: 1.99 },
  { name: "Nubank", color: "bg-purple-600", taxa: 1.79 },
  { name: "Santander", color: "bg-red-500", taxa: 2.09 },
  { name: "Caixa", color: "bg-blue-600", taxa: 1.95 },
  { name: "Inter", color: "bg-orange-600", taxa: 1.85 },
];

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    aprovado: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <CheckCircle className="h-3 w-3" />, label: "Aprovado" },
    analise: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: <Clock3 className="h-3 w-3" />, label: "Em Análise" },
    reprovado: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: <XCircle className="h-3 w-3" />, label: "Reprovado" },
  };
  const v = variants[status] || variants.analise;
  return (
    <Badge variant="outline" className={v.color}>
      <span className="flex items-center gap-1">
        {v.icon}
        {v.label}
      </span>
    </Badge>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 750 ? "text-emerald-500" : score >= 600 ? "text-amber-500" : "text-red-500";
  return <span className={`font-bold ${color}`}>{score}</span>;
}

export default function PeriCredPage() {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("leads");

  const filtered = MOCK_LEADS.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(filter.toLowerCase()) || l.cpf.includes(filter);
    const matchesStatus = statusFilter ? l.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: MOCK_LEADS.length,
    aprovados: MOCK_LEADS.filter((l) => l.status === "aprovado").length,
    analise: MOCK_LEADS.filter((l) => l.status === "analise").length,
    reprovados: MOCK_LEADS.filter((l) => l.status === "reprovado").length,
    valorTotal: MOCK_LEADS.filter((l) => l.status === "aprovado").reduce((a, b) => a + b.valor, 0),
    valorMedio: Math.round(MOCK_LEADS.filter((l) => l.status === "aprovado").reduce((a, b) => a + b.valor, 0) / MOCK_LEADS.filter((l) => l.status === "aprovado").length),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">PeriCred</h1>
                <p className="text-[10px] text-slate-400 -mt-0.5">Sistema de Simulação de Crédito</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sistema Online
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Leads</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12% hoje</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Aprovados</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.aprovados}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                <span>{((stats.aprovados / stats.total) * 100).toFixed(0)}% taxa de aprovação</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Valor Aprovado</p>
                  <p className="text-xl font-bold text-white">
                    R$ {stats.valorTotal.toLocaleString()}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-amber-500" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                <span>Média R$ {stats.valorMedio.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Em Análise</p>
                  <p className="text-2xl font-bold text-amber-400">{stats.analise}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                <span>Tempo médio: 4h</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          <Button
            variant={activeTab === "leads" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("leads")}
            className={activeTab === "leads" ? "bg-emerald-600" : "border-slate-700"}
          >
            <Users className="h-4 w-4 mr-2" />
            Leads
          </Button>
          <Button
            variant={activeTab === "bancos" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("bancos")}
            className={activeTab === "bancos" ? "bg-emerald-600" : "border-slate-700"}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Bancos
          </Button>
          <Button
            variant={activeTab === "simular" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("simular")}
            className={activeTab === "simular" ? "bg-emerald-600" : "border-slate-700"}
          >
            <Zap className="h-4 w-4 mr-2" />
            Simular
          </Button>
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("dashboard")}
            className={activeTab === "dashboard" ? "bg-emerald-600" : "border-slate-700"}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar por nome ou CPF..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(null)}
                  className={statusFilter === null ? "bg-emerald-600" : "border-slate-700"}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === "aprovado" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("aprovado")}
                  className={statusFilter === "aprovado" ? "bg-emerald-600" : "border-slate-700"}
                >
                  Aprovados
                </Button>
                <Button
                  variant={statusFilter === "analise" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("analise")}
                  className={statusFilter === "analise" ? "bg-amber-600" : "border-slate-700"}
                >
                  Análise
                </Button>
              </div>
            </div>

            {/* Leads - Desktop Table */}
            <div className="hidden sm:block">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    Leads Recentes
                    <span className="text-xs text-slate-400 font-normal">({filtered.length} resultados)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-xs">
                          <th className="text-left px-4 py-3 font-medium">ID</th>
                          <th className="text-left px-4 py-3 font-medium">Nome</th>
                          <th className="text-left px-4 py-3 font-medium">CPF</th>
                          <th className="text-left px-4 py-3 font-medium">Valor</th>
                          <th className="text-left px-4 py-3 font-medium">Banco</th>
                          <th className="text-left px-4 py-3 font-medium">Parcela</th>
                          <th className="text-left px-4 py-3 font-medium">Score</th>
                          <th className="text-left px-4 py-3 font-medium">Status</th>
                          <th className="text-left px-4 py-3 font-medium">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((lead) => (
                          <tr key={lead.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 text-slate-500 text-xs">#{lead.id}</td>
                            <td className="px-4 py-3 font-medium text-white">{lead.name}</td>
                            <td className="px-4 py-3 text-slate-400">{lead.cpf}</td>
                            <td className="px-4 py-3 text-emerald-400 font-medium">
                              R$ {lead.valor.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-slate-300">{lead.banco}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {lead.prazo}x R$ {lead.parcela}
                            </td>
                            <td className="px-4 py-3">
                              <ScoreBadge score={lead.score} />
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={lead.status} />
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{lead.data}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leads - Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((lead) => (
                <Card key={lead.id} className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-white text-sm">{lead.name}</p>
                        <p className="text-xs text-slate-400">{lead.cpf}</p>
                      </div>
                      <StatusBadge status={lead.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400">Valor</p>
                        <p className="text-emerald-400 font-bold">R$ {lead.valor.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400">Parcela</p>
                        <p className="text-white font-bold">{lead.prazo}x R$ {lead.parcela}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400">Banco</p>
                        <p className="text-white font-bold">{lead.banco}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400">Score</p>
                        <p className="font-bold"><ScoreBadge score={lead.score} /></p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{lead.data}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Bancos Tab */}
        {activeTab === "bancos" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BANKS.map((bank) => (
              <Card key={bank.name} className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${bank.color} flex items-center justify-center`}>
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{bank.name}</h3>
                      <p className="text-xs text-slate-400">Taxa: {bank.taxa}% a.m.</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400">Aprovação</p>
                      <p className="text-emerald-400 font-bold">{(Math.random() * 30 + 60).toFixed(0)}%</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400">Prazo Máx</p>
                      <p className="text-white font-bold">{Math.floor(Math.random() * 36 + 24)}x</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Simular Tab */}
        {activeTab === "simular" && (
          <SimuladorCard />
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-emerald-500" />
                    Distribuição por Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Aprovados</span>
                        <span className="text-emerald-400">{stats.aprovados} ({((stats.aprovados/stats.total)*100).toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(stats.aprovados/stats.total)*100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Em Análise</span>
                        <span className="text-amber-400">{stats.analise} ({((stats.analise/stats.total)*100).toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(stats.analise/stats.total)*100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Reprovados</span>
                        <span className="text-red-400">{stats.reprovados} ({((stats.reprovados/stats.total)*100).toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.reprovados/stats.total)*100}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Volume por Banco
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {BANKS.map((bank) => {
                      const bankLeads = MOCK_LEADS.filter((l) => l.banco === bank.name);
                      const bankValue = bankLeads.reduce((a, b) => a + b.valor, 0);
                      return (
                        <div key={bank.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{bank.name}</span>
                            <span className="text-white">R$ {bankValue.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${bank.color} rounded-full`} style={{ width: `${(bankValue / stats.valorTotal) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SimuladorCard() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [renda, setRenda] = useState(3000);
  const [valor, setValor] = useState(15000);
  const [prazo, setPrazo] = useState(24);
  const [banco, setBanco] = useState("Nubank");
  const [score, setScore] = useState(750);
  const [gerado, setGerado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const bankTaxa = BANKS.find((b) => b.name === banco)?.taxa || 1.99;
  const scoreBonus = score >= 800 ? 0.3 : score >= 700 ? 0.15 : score >= 600 ? 0 : -0.5;
  const taxaFinal = Math.max(0.5, bankTaxa - scoreBonus);
  const parcela = Math.round((valor * (taxaFinal / 100)) / (1 - Math.pow(1 + taxaFinal / 100, -prazo)));
  const total = parcela * prazo;
  const juros = total - valor;
  const codigo = "PRC" + Date.now().toString(36).toUpperCase();
  const dataHora = new Date().toLocaleString("pt-BR");
  const protocolo = "PERI" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleGerar = () => {
    setGerando(true);
    setTimeout(() => {
      setGerando(false);
      setGerado(true);
    }, 2000);
  };

  const handleCopiar = () => {
    const texto = mensagemEngenharia(nome, valor, parcela, prazo, banco, taxaFinal, total, codigo, protocolo);
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const rendaMinima = Math.round(parcela * 2.5);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Formulario */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-emerald-500" />
            Consulta de Proposta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nome completo</label>
              <Input
                placeholder="Digite o nome do cliente"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">CPF</label>
              <Input
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Valor desejado</label>
              <div className="flex items-center gap-3">
                <Input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={valor}
                  onChange={(e) => setValor(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-emerald-400 font-bold min-w-[80px] text-right text-sm">
                  R$ {valor.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Prazo (meses)</label>
              <div className="flex items-center gap-3">
                <Input
                  type="range"
                  min="6"
                  max="60"
                  step="6"
                  value={prazo}
                  onChange={(e) => setPrazo(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-white font-bold min-w-[50px] text-right text-sm">{prazo}x</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Banco</label>
              <div className="flex gap-2 flex-wrap">
                {BANKS.map((b) => (
                  <Button
                    key={b.name}
                    variant={banco === b.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBanco(b.name)}
                    className={banco === b.name ? "bg-emerald-600" : "border-slate-700"}
                  >
                    {b.name}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Score Serasa</label>
              <div className="flex items-center gap-3">
                <Input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="flex-1"
                />
                <span className={`font-bold min-w-[50px] text-right text-sm ${score >= 750 ? "text-emerald-400" : score >= 600 ? "text-amber-400" : "text-red-400"}`}>
                  {score}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Renda mensal declarada</label>
            <div className="flex items-center gap-3">
              <Input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={renda}
                onChange={(e) => setRenda(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-emerald-400 font-bold min-w-[80px] text-right text-sm">
                R$ {renda.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            onClick={handleGerar}
            disabled={gerando || !nome}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            {gerando ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Consultando base de dados...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Gerar Proposta Oficial
              </>
            )}
          </Button>
          {!nome && <p className="text-xs text-amber-400 text-center">Preencha o nome para gerar</p>}
        </CardContent>
      </Card>

      {/* Proposta Gerada - Estilo Documento Oficial */}
      {gerado && (
        <>
          <div id="proposta-oficial" className="bg-white rounded-lg p-6 text-slate-900 shadow-lg border border-slate-200">
            {/* Cabecalho */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">PeriCred</h2>
                  <p className="text-xs text-slate-500">Proposta de Empréstimo Pessoal</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Proposta</p>
                <p className="font-bold text-emerald-600">{codigo}</p>
                <p className="text-xs text-slate-400 mt-1">{dataHora}</p>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Dados do Cliente</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Nome</p>
                  <p className="font-medium text-slate-900">{nome || "---"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">CPF</p>
                  <p className="font-medium text-slate-900">{cpf || "---"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Renda declarada</p>
                  <p className="font-medium text-slate-900">R$ {renda.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Score Serasa</p>
                  <p className={`font-bold ${score >= 750 ? "text-emerald-600" : score >= 600 ? "text-amber-600" : "text-red-600"}`}>{score}</p>
                </div>
              </div>
            </div>

            {/* Dados da Proposta */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Condições da Proposta</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Banco</p>
                  <p className="font-bold text-slate-900">{banco}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Valor solicitado</p>
                  <p className="font-bold text-emerald-600">R$ {valor.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Prazo</p>
                  <p className="font-bold text-slate-900">{prazo}x</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Taxa de juros</p>
                  <p className="font-bold text-slate-900">{taxaFinal.toFixed(2)}% a.m.</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Parcela</p>
                  <p className="font-bold text-emerald-600 text-lg">R$ {parcela.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="font-bold text-slate-900">R$ {total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-emerald-700">PRÉ-APROVADO</p>
                  <p className="text-xs text-emerald-600">
                    Proposta pré-aprovada na instituição {banco}. Validade: 24 horas.
                  </p>
                </div>
              </div>
            </div>

            {/* Protocolo */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200 pt-3">
              <span>Protocolo: {protocolo}</span>
              <span>PeriCred - Consultoria de Crédito</span>
            </div>
          </div>

          {/* Mensagem de WhatsApp */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                Mensagem para o Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {mensagemEngenharia(nome, valor, parcela, prazo, banco, taxaFinal, total, codigo, protocolo)}
              </div>
              <Button
                onClick={handleCopiar}
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
              >
                {copiado ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copiado! Cole no WhatsApp
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar mensagem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function mensagemEngenharia(
  nome: string,
  valor: number,
  parcela: number,
  prazo: number,
  banco: string,
  taxa: number,
  total: number,
  codigo: string,
  protocolo: string
) {
  return `Oi ${nome.split(" ")[0]}! Boa notícia 🎉

Acabei de consultar sua proposta na base do ${banco} e deu PRÉ-APROVADO.

💰 Valor: R$ ${valor.toLocaleString()}
📅 Prazo: ${prazo}x de R$ ${parcela.toLocaleString()}
📊 Taxa: ${taxa.toFixed(2)}% a.m.

Para fechar, preciso que você me envie:
✅ Foto do RG frente e verso
✅ Selfie segurando o RG
✅ Comprovante de renda (ou prints do app do banco)

Quanto mais rápido mandar, mais rápido cai na conta. Essa proposta tem validade de 24h.

Me manda agora que eu já subo seu processo.

Proposta: ${codigo}
Protocolo: ${protocolo}`;
}
