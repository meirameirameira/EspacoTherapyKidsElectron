export const pacienteColumns = [

  { key: 'codigo', label: 'Código do Paciente' },
  { key: 'nome',   label: 'Nome do Paciente' },
  { key: 'nrResponsavel', label: 'Celular do Responsável' },
  { key: 'nmResponsavel', label: 'Nome do Responsável' },

  {
    key: 'fonoValor',
    label: 'FONO Valor',
    decimals: 2,
    computed: p => p.fono?.preco
  },
  {
    key: 'fonoHoras',
    label: 'FONO Horas',
    computed: p => p.fono?.horas
  },
  {
    key: 'fonoTotal',
    label: 'FONO Total',
    decimals: 2,
    computed: p => (p.fono?.preco || 0) * (p.fono?.horas || 0)
  },
  {
    key: 'fonoReembolso',
    label: 'FONO Reembolso',
    decimals: 2,
    computed: p => p.fono?.reembolsoInformado
  },
  {
    key: 'fonoNF',
    label: 'FONO NF',
    computed: p => {
      const preco = p.fono?.preco || 0;
      const horas = p.fono?.horas || 0;
      const remb  = p.fono?.reembolsoInformado;
      return remb > 0 ? Math.ceil((preco * horas) / remb) : 0;
    }
  },

  {
    key: 'toValor',
    label: 'TO Valor',
    decimals: 2,
    computed: p => p.terapiaOcupacional?.preco
  },
  {
    key: 'toHoras',
    label: 'TO Horas',
    computed: p => p.terapiaOcupacional?.horas
  },
  {
    key: 'toTotal',
    label: 'TO Total',
    decimals: 2,
    computed: p => (p.terapiaOcupacional?.preco || 0) * (p.terapiaOcupacional?.horas || 0)
  },
  {
    key: 'toReembolso',
    label: 'TO Reembolso',
    decimals: 2,
    computed: p => p.terapiaOcupacional?.reembolsoInformado
  },
  {
    key: 'toNF',
    label: 'TO NF',
    computed: p => {
      const preco = p.terapiaOcupacional?.preco || 0;
      const horas = p.terapiaOcupacional?.horas || 0;
      const remb  = p.terapiaOcupacional?.reembolsoInformado;
      return remb > 0 ? Math.ceil((preco * horas) / remb) : 0;
    }
  },

  {
    key: 'abaValor',
    label: 'ABA Pacote',
    decimals: 2,
    computed: p => p.aba?.preco
  },
  {
    key: 'abaReembolso',
    label: 'ABA Reembolso',
    decimals: 2,
    computed: p => p.aba?.reembolsoInformado
  },
  {
    key: 'abaNF',
    label: 'ABA NF',
    computed: p => {
      const preco = p.aba?.preco || 0;
      const remb  = p.aba?.reembolsoInformado;
      return remb > 0 ? Math.ceil(preco / remb) : 0;
    }
  },
];
