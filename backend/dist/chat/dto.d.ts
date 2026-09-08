export declare class CreateDirectConversationDto {
    userId: string;
}
export declare class CreateGroupConversationDto {
    name: string;
    userIds: string[];
}
export declare class AddMemberDto {
    userId: string;
}
export declare class SendMessageDto {
    content: string;
}
