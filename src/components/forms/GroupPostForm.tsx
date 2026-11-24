"use client";
import { postToGroup } from "@/app/actions/member";
import { ActionForm } from "./ActionForm";
import { TextArea } from "@/components/ui";

export function GroupPostForm({ groupId }: { groupId: string }) {
  return (
    <ActionForm action={postToGroup} submitLabel="Post" protect={false} className="space-y-3">
      <input type="hidden" name="group_id" value={groupId} />
      <TextArea label="Share with the group" name="body" rows={3} required maxLength={2000} />
    </ActionForm>
  );
}
