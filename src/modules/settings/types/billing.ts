export interface BillingStat {
  value: string;
  label: string;
  detail: string;
}

export interface WorkerUsage {
  name: string;
  tasksMTD: string;
  success: string;
  effortSaved: string;
}
