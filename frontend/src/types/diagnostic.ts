export interface DiagnosticNode {
  id: string;
  question_text: string;
  is_solution: boolean;
  solution_details: string | null;
  parent_node_id: string | null;
}

export interface DiagnosticNodeOption {
  id: string;
  diagnostic_node_id: string;
  option_text: string;
  next_node_id: string | null;
}
